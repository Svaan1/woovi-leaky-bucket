import { useState } from "react";
import { useRouter } from "next/router";

import { 
    Search, 
    AccountBalance, 
    CheckCircle,
    ErrorOutline
} from "@mui/icons-material";
import { 
    Box, 
    Button, 
    Container, 
    TextField, 
    Card, 
    CardContent,
    Chip,
    InputAdornment,
    Alert,
    Fade,
    CircularProgress,
    Typography
} from "@mui/material";
import { useMutation } from "react-relay";
import { graphql } from "relay-runtime";

import { useAuth } from "../auth/AuthContext";
import { pagesPixMutation as PixPixMutationType } from "../__generated__/pagesPixMutation.graphql";
import Header from "../components/Header";
import PageTitle from "../components/PageTitle";

const styles = {
    mainCard: {
        width: '100%',
        maxWidth: '600px',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 2,
        p: 4,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
    },
    inputSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    resultCard: {
        mt: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
    },
    resultHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        bgcolor: 'rgba(3, 214, 157, 0.1)',
    },
    resultContent: {
        p: 2,
    },
    pixTypeChip: {
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 500,
        bgcolor: 'rgb(3, 214, 157)',
        color: 'white',
        '& .MuiChip-icon': {
            color: 'white',
        },
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        mt: 2,
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4,
    },
};

const Index = () => {
    const PixMutation = graphql`
        mutation pagesPixMutation($pixKey: String!, $value: Float!) {
            PixTransaction(input: {
                pixKey: $pixKey,
                value: $value
            }) {
                name,
                bank
            }
        }
    `;
    
    const [pixKey, setPixKey] = useState("");
    const [value, setValue] = useState("");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [commitMutation, isMutationInFlight] = useMutation<PixPixMutationType>(PixMutation);

    const { token } = useAuth();
    const router = useRouter();

    if (!token) {
        router.push('/login');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResult(null);

        if (isMutationInFlight) {
            return;
        }

        // Simulated API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        commitMutation({
            variables: {
                pixKey: pixKey,
                value: parseFloat(value)
            },
            onCompleted: (response, errors) => {
                
                if (errors) {
                    const errorMessage = errors.map(e => e.message).join(', ');
                    setError(errorMessage);
                    return;
                }

                if (response.PixTransaction) {
                    setResult(response.PixTransaction);
                    console.log(response)
                }
            },
            onError: (error) => {
                const message = error.message;
                const jsonString = message.substring(message.indexOf('['));
                const errors = JSON.parse(jsonString);

                if (Array.isArray(errors) && errors.length > 0 && errors[0].message) {
                    setError(errors[0].message);
                } else {
                    setError("An unknown error occurred.");
                }
            }
        });
        
    };

    return (
        <Container sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            minHeight: '100vh',
            p: 2,
            pt: 6,
        }}>
            <Header />

            <Card sx={styles.mainCard}>
                <CardContent>
                    <PageTitle 
                        title="Consultar Chave PIX"
                        subtitle="Digite a chave PIX e o valor para simular uma transação"
                    />

                    <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
                        <Box sx={styles.inputSection}>
                            <TextField
                                label="Chave PIX"
                                placeholder="E-mail, telefone, CPF ou chave aleatória"
                                fullWidth
                                value={pixKey}
                                onChange={(e) => setPixKey(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccountBalance color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                required
                            />
                            
                            <TextField
                                label="Valor"
                                type="number"
                                placeholder="0,00"
                                fullWidth
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            R$
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    step: "0.01",
                                    min: "0.01"
                                }}
                                required
                            />
                        </Box>

                        <Button
                            variant="contained"
                            fullWidth
                            type="submit"
                            disabled={!pixKey || !value || isMutationInFlight}
                        >
                            {isMutationInFlight ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                    Consultando...
                                </>
                            ) : (
                                <>
                                    <Search sx={{ mr: 1 }} />
                                    Consultar PIX
                                </>
                            )}
                        </Button>
                    </Box>

                    {error && (
                        <Fade in>
                            <Alert 
                                severity="error" 
                                sx={{ mt: 2 }}
                                icon={<ErrorOutline />}
                            >
                                {error}
                            </Alert>
                        </Fade>
                    )}

                    {result && (
                        <Fade in>
                            <Card sx={styles.resultCard}>
                                <Box sx={styles.resultHeader}>
                                    <CheckCircle sx={{ color: 'rgb(3, 214, 157)' }} />
                                    <Typography variant="h6" sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
                                        Chave PIX Encontrada
                                    </Typography>
                                    <Chip
                                        icon={<AccountBalance />}
                                        label="Chave Aleatória"
                                        size="small"
                                        sx={styles.pixTypeChip}
                                    />
                                </Box>
                                
                                <CardContent sx={styles.resultContent}>
                                    <Box sx={styles.userInfo}>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            <strong>Destinatário:</strong> {result.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Banco:</strong> {result.bank}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Fade>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default Index;

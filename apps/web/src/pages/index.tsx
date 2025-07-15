import { useState } from "react";
import { useRouter } from "next/router";

import { 
    Search, 
    AccountBalance, 
    Phone, 
    Email, 
    CreditCard, 
    CheckCircle,
    ErrorOutline
} from "@mui/icons-material";
import { 
    Box, 
    Button, 
    Container, 
    TextField, 
    Theme, 
    Typography, 
    Card, 
    CardContent,
    Chip,
    InputAdornment,
    Alert,
    Fade,
    CircularProgress
} from "@mui/material";
import { SxProps } from "@mui/system";
import { useMutation } from "react-relay";
import { graphql } from "relay-runtime";

import { useAuth } from "../auth/AuthContext";
import { WooviIcon } from "../components/WooviIcon";
import { pagesPixMutation as PixPixMutationType } from "../__generated__/pagesPixMutation.graphql";

const styles: { [key: string]: SxProps<Theme> } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        p: 2,
        pt: 6,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 4,
    },
    wooviIcon: {
        width: '120px',
        height: 'auto',
    },
    headerTitle: {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '32px',
        fontWeight: 600,
        color: 'text.primary',
    },
    mainCard: {
        width: '100%',
        maxWidth: '600px',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        boxShadow: 2,
        p: 4,
    },
    title: {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '24px',
        fontWeight: 600,
        textAlign: 'center',
        mb: 1,
        color: 'text.primary',
    },
    subtitle: {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '16px',
        fontWeight: 400,
        textAlign: 'center',
        mb: 4,
        color: 'text.secondary',
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
    pixKeyInput: {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
        },
    },
    valueInput: {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
        },
    },
    button: {
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 600,
        textTransform: 'inherit',
        backgroundColor: 'rgb(3, 214, 157)',
        borderRadius: 2,
        py: 1.5,
        fontSize: '16px',
        '&:hover': {
            backgroundColor: 'rgb(2, 179, 131)',
        },
        '&:disabled': {
            backgroundColor: 'rgba(3, 214, 157, 0.5)',
        },
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
        <Container sx={styles.container}>
            <Box sx={styles.header}>
                <WooviIcon sx={styles.wooviIcon} />
            </Box>

            <Card sx={styles.mainCard}>
                <CardContent>
                    <Typography sx={styles.title}>
                        Consultar Chave PIX
                    </Typography>
                    
                    <Typography sx={styles.subtitle}>
                        Digite a chave PIX e o valor para simular uma transação
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
                        <Box sx={styles.inputSection}>
                            <TextField
                                label="Chave PIX"
                                placeholder="E-mail, telefone, CPF ou chave aleatória"
                                fullWidth
                                value={pixKey}
                                onChange={(e) => setPixKey(e.target.value)}
                                sx={styles.pixKeyInput}
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
                                sx={styles.valueInput}
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
                            sx={styles.button}
                            type="submit"
                            disabled={!pixKey || !value || isMutationInFlight || isMutationInFlight}
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

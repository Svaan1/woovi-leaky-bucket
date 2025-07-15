import { useState } from "react";
import { useRouter } from "next/router";

import { ArrowForward } from "@mui/icons-material";
import { Box, Button, Container, Link, TextField, Theme, Typography } from "@mui/material";
import { SxProps } from "@mui/system";
import { useMutation } from "react-relay";
import { graphql } from "relay-runtime";

import { useAuth } from "../auth/AuthContext";
import EmailField from "../components/EmailField";
import { WooviIcon } from "../components/WooviIcon";
import { loginMutation as LoginMutationType } from "../__generated__/loginMutation.graphql";

const styles: { [key: string]: SxProps<Theme> } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        p: 2,
    },
    wooviIcon: {
        width: '140px',
        height: 'auto',
        mb: 4,
    },
    box: {
        width: '100%',
        maxWidth: '485px',
        color: 'text.primary',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 1,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
    },
    title: {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '27px',
        fontWeight: 500,
        textAlign: 'center',
        mb: 3,
    },
    form: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    button: {
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 500,
        textTransform: 'inherit',
        backgroundColor: 'rgb(3, 214, 157)',
        '&:hover': {
            backgroundColor: 'rgb(2, 179, 131)',
        },
    },
    arrowForward: {
        ml: 1,
    },
    registerBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
        gap: 1,
    },
    registerLink: {
        color: 'rgb(3, 214, 157)',
        textDecoration: 'none',
    },
};

const Login = () => {
    const LoginMutation = graphql`
        mutation loginMutation($email: String!, $password: String!) {
            UserLogin(input: {
                email: $email,
                password: $password
            }) {
                token
            }
        }
    `
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [commitMutation, isMutationInFlight] = useMutation<LoginMutationType>(LoginMutation);
    const { login } = useAuth();
    const router = useRouter();
    
    function handleSubmit(e) {
        e.preventDefault()

        const data = commitMutation({
            variables: {
                email: email,
                password: password
            },

            onCompleted: (response, errors) => {
                setError(null);

                if (errors) {
                    const errorMessage = errors.map(e => e.message).join(', ');
                    setError(errorMessage);
                    return;
                }

                if (response.UserLogin?.token) {
                    login(response.UserLogin.token);
                    router.push('/');
                }
            },

            onError: (error) => {
                try {
                    const message = error.message;
                    const jsonString = message.substring(message.indexOf('['));
                    const errors = JSON.parse(jsonString);
                    if (Array.isArray(errors) && errors.length > 0 && errors[0].message) {
                        setError(errors[0].message);
                    } else {
                        setError("An unknown error occurred.");
                    }
                } catch (e) {
                    setError(error.message);
                }
            }
        })

    }

    return <>
        <Container sx={styles.container}>

            <WooviIcon sx={styles.wooviIcon}/>

            <Box sx={styles.box}>

                <Typography sx={styles.title}>
                    Login
                </Typography>

                {error && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
                    <EmailField
                        email={email}
                        setEmail={setEmail}
                        isEmailValid={isEmailValid}
                        setIsEmailValid={setIsEmailValid}
                    />
                    <TextField
                        label="Senha"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        sx={styles.button}
                        type="submit"
                        disabled={!isEmailValid || isMutationInFlight}
                    >
                        Continuar
                        <ArrowForward sx={styles.arrowForward}/>
                    </Button>
                </Box>
            </Box>
            <Box sx={styles.registerBox}>
                <Typography variant="body2">
                    Novo na Woovi?
                </Typography>
                <Link href="/register" sx={styles.registerLink}>
                    <Typography variant="body2">
                        Clique aqui pra se cadastrar
                    </Typography>
                </Link>
            </Box>
        </Container>
    </>
}

export default Login;
import { useState } from "react";
import { useRouter } from "next/router";

import { ArrowForward } from "@mui/icons-material";
import { Box, Button, Container, Link, TextField, Typography } from "@mui/material";
import { useMutation } from "react-relay";
import { graphql } from "relay-runtime";

import { useAuth } from "../auth/AuthContext";
import EmailField from "../components/EmailField";
import { loginMutation as LoginMutationType } from "../__generated__/loginMutation.graphql";
import Header from "../components/Header";

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
    
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        commitMutation({
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
        <Container sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            p: 2,
        }}>

            <Header />

            <Box sx={{
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
            }}>

                <Typography variant="h2" textAlign="center" mb={3}>
                    Login
                </Typography>

                {error && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}>
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
                        type="submit"
                        disabled={!isEmailValid || isMutationInFlight}
                    >
                        Continuar
                        <ArrowForward sx={{ ml: 1 }}/>
                    </Button>
                </Box>
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mt: 4,
                gap: 1,
            }}>
                <Typography variant="body2">
                    Novo na Woovi?
                </Typography>
                <Link href="/register" sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                }}>
                    <Typography variant="body2">
                        Clique aqui pra se cadastrar
                    </Typography>
                </Link>
            </Box>
        </Container>
    </>
}

export default Login;
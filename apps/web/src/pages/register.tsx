import { useState } from "react";
import { useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { parseError } from "../relay/utils";

import { ArrowForward } from "@mui/icons-material";
import { Box, Link, Typography } from "@mui/material";

import { EmailField, Header, FormBox, PageTitle} from "../components";
import { StyledButton, StyledContainer, StyledTextField, StyledLink } from "@woovi-playground/ui";

import { registerMutation as RegisterMutationType } from "../__generated__/registerMutation.graphql";

const Register = () => {
    const RegisterMutation = graphql`
        mutation registerMutation($email: String!, $password: String!) {
            UserSignup(input: {
                email: $email,
                password: $password,
            }) {
                token
            }
        }
    `
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [commitMutation, isMutationInFlight] = useMutation<RegisterMutationType>(RegisterMutation);
    
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

                if (response.UserSignup?.token) {
                }
            },

            onError: (error) => {
                setError(parseError(error))
            }
        })

    }

    return <>
        <StyledContainer>

            <Header />

            <FormBox onSubmit={handleSubmit}>

                <PageTitle 
                    title="Crie sua Conta"
                    subtitle="Cadastre-se rapidamente e comece a vender mais"
                />

                {error && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}

                <EmailField
                    email={email}
                    setEmail={setEmail}
                    isEmailValid={isEmailValid}
                    setIsEmailValid={setIsEmailValid}
                />
                <StyledTextField
                    label="Senha"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <StyledButton
                    variant="contained"
                    fullWidth
                    type="submit"
                    disabled={!isEmailValid || isMutationInFlight}
                >
                    Continuar
                    <ArrowForward sx={{ ml: 1 }}/>
                </StyledButton>
            </FormBox>

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mt: 4,
                gap: 1,
            }}>
                <Typography variant="body2">
                    Já tem uma conta?
                </Typography>
                <StyledLink>
                    <Typography variant="body2">
                        Clique aqui para fazer login
                    </Typography>
                </StyledLink>
            </Box>
        </StyledContainer>
    </>
}

export default Register;
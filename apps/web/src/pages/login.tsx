import { useState } from "react";
import { graphql } from "relay-runtime";
import { useMutation } from "react-relay";
import { parseError } from "../relay/utils";
import { setCookie } from "nookies";
import Router from "next/router";

import { ArrowForward } from "@mui/icons-material";
import { Box, Link, Typography } from "@mui/material";
import { EmailField, Header, FormBox, PageTitle } from "../components";

import {
  StyledTextField,
  StyledContainer,
  StyledButton,
  StyledLink,
} from "@woovi-playground/ui";

import { loginMutation as LoginMutationType } from "../__generated__/loginMutation.graphql";

const Login = () => {
  const LoginMutation = graphql`
    mutation loginMutation($email: String!, $password: String!) {
      UserLogin(input: { email: $email, password: $password }) {
        token
      }
    }
  `;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commitMutation, isMutationInFlight] =
    useMutation<LoginMutationType>(LoginMutation);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    commitMutation({
      variables: {
        email: email,
        password: password,
      },

      onCompleted: (response, errors) => {
        setError(null);

        if (errors) {
          const errorMessage = errors.map((e) => e.message).join(", ");
          setError(errorMessage);
          return;
        }

        if (response.UserLogin?.token) {
          setCookie(undefined, "woovi.token", response.UserLogin.token, {
            maxAge: 60 * 60 * 1,
          });
          Router.push("/");
        }
      },

      onError: (error) => {
        setError(parseError(error));
      },
    });
  }

  return (
    <>
      <StyledContainer>
        <Header />

        <FormBox onSubmit={handleSubmit}>
          <PageTitle title="Login" />

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
            Continuar <ArrowForward sx={{ ml: 1 }} />
          </StyledButton>
        </FormBox>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 4,
            gap: 1,
          }}
        >
          <Typography variant="body2">Novo na Woovi?</Typography>
          <StyledLink href="/register">
            <Typography variant="body2">
              Clique aqui pra se cadastrar
            </Typography>
          </StyledLink>
        </Box>
      </StyledContainer>
    </>
  );
};

export default Login;

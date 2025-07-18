import Router from "next/router";
import { useState } from "react";
import { graphql } from "relay-runtime";
import { useMutation } from "react-relay";
import { parseError } from "../relay/utils";
import { useForm } from "react-hook-form";
import { setCookie } from "nookies";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Fade, FormControl, FormHelperText, Snackbar, Alert } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";

import { FormTitle, AppLogo, FormContainer, AuthFooter, AuthError, AuthSuccess } from "../components";
import { StyledContainer, StyledTextField, StyledButton } from "@woovi-playground/ui";

import { loginMutation as LoginMutationType } from "../__generated__/loginMutation.graphql";

const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const LoginMutation = graphql`
    mutation loginMutation($email: String!, $password: String!) {
      UserLogin(input: { email: $email, password: $password }) {
        token
      }
    }
  `;
  
  const {  register, handleSubmit: validateForm, formState: { errors, isValid }, getValues } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange"
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [commitMutation, isMutationInFlight] = useMutation<LoginMutationType>(LoginMutation);

  function handleSubmit(formValues: LoginFormValues) {
    setError(null);
    
    commitMutation({
      variables: {
        email: formValues.email,
        password: formValues.password,
      },

      onCompleted: (response, errors) => {
        if (errors) {
          const errorMessage = errors.map((e) => e.message).join(", ");
          setError(errorMessage);
          return;
        }

        if (response.UserLogin?.token) {
          setCookie(undefined, "woovi.token", response.UserLogin.token, {
            maxAge: 60 * 60 * 1,
          });
          
          setSuccess(true);
          
          setTimeout(() => {
            setRedirecting(true);
            setTimeout(() => Router.push("/"), 50);
          }, 1000);
        }
      },

      onError: (error) => {
        setError(parseError(error));
      },
    });
  }

  return (
    <Fade in={!redirecting} timeout={250}>
      <StyledContainer>
        <AppLogo/>
        
        <AuthSuccess success={success}>
          Login realizado com sucesso! Redirecionando...
        </AuthSuccess>

        <FormContainer onSubmit={validateForm(handleSubmit)}>
          <FormTitle title="Login" />
          
          {error && <AuthError error={error} />}
          
          <FormControl fullWidth error={!!errors.email}>
            <StyledTextField
              label="Email"
              type="email"
              fullWidth
              {...register("email")}
              error={!!errors.email}
            />
            {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
          </FormControl>
          
          <FormControl fullWidth error={!!errors.password}>
            <StyledTextField
              label="Senha"
              type="password"
              fullWidth
              {...register("password")}
              error={!!errors.password}
            />
            {errors.password && <FormHelperText>{errors.password.message}</FormHelperText>}
          </FormControl>
          
          <StyledButton
            variant="contained"
            fullWidth
            type="submit"
            loading={isMutationInFlight}
            disabled={!isValid || isMutationInFlight || success}
            sx={{ mt: 2 }}
          >
            {isMutationInFlight ? "Autenticando..." : "Continuar"}
            {!isMutationInFlight && <ArrowForward sx={{ ml: 1 }} />}
          </StyledButton>
        </FormContainer>
        
        <AuthFooter
          text="Novo na Woovi?"
          linkText="Clique aqui pra se cadastrar"
          linkHref="/register"
        />

      </StyledContainer>
    </Fade>
  );
};

export default Login;

import { useState } from "react";
import { useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { parseError } from "../relay/utils";
import { setCookie } from "nookies";
import Router from "next/router";
import { Fade, FormControl, FormHelperText, Snackbar, Alert } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormTitle, AppLogo, FormContainer, AuthFooter, AuthError, AuthSuccess } from "../components";
import { StyledContainer, StyledTextField, StyledButton } from "@woovi-playground/ui";

import { registerMutation as RegisterMutationType } from "../__generated__/registerMutation.graphql";

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.email("Email inválido"),
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
    .regex(/\d/, "Deve conter pelo menos um número")
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const RegisterMutation = graphql`
    mutation registerMutation($name: String!, $email: String!, $password: String!) {
      UserSignup(input: { name: $name, email: $email, password: $password }) {
        token
      }
    }
  `;
  
  const { register, handleSubmit: validateForm, formState: { errors, isValid }, getValues } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange"
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const [commitMutation, isMutationInFlight] = useMutation<RegisterMutationType>(RegisterMutation);

  function handleSubmit(formValues: RegisterFormValues) {
    setError(null);
    
    commitMutation({
      variables: {
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
      },

      onCompleted: (response, errors) => {
        if (errors) {
          const errorMessage = errors.map((e) => e.message).join(", ");
          setError(errorMessage);
          return;
        }

        if (response.UserSignup?.token) {
          setCookie(undefined, "woovi.token", response.UserSignup.token, {
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
        <AppLogo />

        <AuthSuccess success={success}>
          Conta criada com sucesso. Redirecionando...
        </AuthSuccess>        
        
        <FormContainer onSubmit={validateForm(handleSubmit)}>
          <FormTitle 
            title="Crie sua Conta" 
            subtitle="Cadastre-se rapidamente e comece a vender mais"
          />
          
          {error && <AuthError error={error} />}
          
          <FormControl fullWidth error={!!errors.name}>
            <StyledTextField
              label="Nome Completo"
              fullWidth
              {...register("name")}
              error={!!errors.name}
            />
            {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
          </FormControl>
          
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
            {isMutationInFlight ? "Registrando..." : "Continuar"}
            {!isMutationInFlight && <ArrowForward sx={{ ml: 1 }} />}
          </StyledButton>

          <AuthFooter
            text="Já tem uma conta?"
            linkText="Clique aqui para fazer login"
            linkHref="/login"
          />
        </FormContainer>
        
      </StyledContainer>
    </Fade>
  );
};

export default Register;

import { ArrowForward } from "@mui/icons-material";
import { StyledButton } from "@woovi-playground/ui";
import { FormContainer, FormTitle, EmailField, PasswordField, AuthError } from "./";

interface AuthFormProps {
  title: string;
  subtitle?: string;
  email: string;
  password: string;
  isEmailValid: boolean;
  error: string | null;
  isLoading: boolean;
  buttonText: string;
  onSubmit: (e: React.FormEvent) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onEmailValidChange: (isValid: boolean) => void;
}

export const AuthForm = ({
  title,
  subtitle,
  email,
  password,
  isEmailValid,
  error,
  isLoading,
  buttonText,
  onSubmit,
  onEmailChange,
  onPasswordChange,
  onEmailValidChange,
}: AuthFormProps) => {
  return (
    <FormContainer onSubmit={onSubmit}>
      <FormTitle title={title} subtitle={subtitle} />

      {error && <AuthError error={error} />}

      <EmailField
        email={email}
        setEmail={onEmailChange}
        isEmailValid={isEmailValid}
        setIsEmailValid={onEmailValidChange}
      />
      
      <PasswordField
        password={password}
        setPassword={onPasswordChange}
      />
      
      <StyledButton
        variant="contained"
        fullWidth
        type="submit"
        disabled={!isEmailValid || isLoading}
      >
        {buttonText}
        <ArrowForward sx={{ ml: 1 }} />
      </StyledButton>
    </FormContainer>
  );
};

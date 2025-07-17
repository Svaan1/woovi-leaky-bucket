import { ArrowForward } from "@mui/icons-material";
import { StyledButton } from "@woovi-playground/ui";
import { FormContainer, FormTitle, EmailField, PasswordField, NameField, AuthError } from "./";

interface AuthFormProps {
  title: string;
  subtitle?: string;
  name?: string;
  email: string;
  password: string;
  isNameValid?: boolean;
  isEmailValid: boolean;
  isPasswordValid?: boolean;
  error: string | null;
  isLoading: boolean;
  buttonText: string;
  onSubmit: (e: React.FormEvent) => void;
  onNameChange?: (name: string) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onNameValidChange?: (isValid: boolean) => void;
  onEmailValidChange: (isValid: boolean) => void;
  onPasswordValidChange?: (isValid: boolean) => void;
  showNameField?: boolean;
  showPasswordValidation?: boolean;
}

export const AuthForm = ({
  title,
  subtitle,
  name,
  email,
  password,
  isNameValid,
  isEmailValid,
  isPasswordValid,
  error,
  isLoading,
  buttonText,
  onSubmit,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onNameValidChange,
  onEmailValidChange,
  onPasswordValidChange,
  showNameField = false,
  showPasswordValidation = false,
}: AuthFormProps) => {
  return (
    <FormContainer onSubmit={onSubmit}>
      <FormTitle title={title} subtitle={subtitle} />

      {error && <AuthError error={error} />}

      {showNameField && name !== undefined && onNameChange && isNameValid !== undefined && onNameValidChange && (
        <NameField
          name={name}
          setName={onNameChange}
          isNameValid={isNameValid}
          setIsNameValid={onNameValidChange}
        />
      )}

      <EmailField
        email={email}
        setEmail={onEmailChange}
        isEmailValid={isEmailValid}
        setIsEmailValid={onEmailValidChange}
      />
      
      <PasswordField
        password={password}
        setPassword={onPasswordChange}
        isPasswordValid={showPasswordValidation ? isPasswordValid : undefined}
        setIsPasswordValid={showPasswordValidation ? onPasswordValidChange : undefined}
      />
      
      <StyledButton
        variant="contained"
        fullWidth
        type="submit"
        loading={isLoading}
        disabled={!isEmailValid || (showNameField && !isNameValid) || (showPasswordValidation && !isPasswordValid)}
      >
        {buttonText}
        {!isLoading && <ArrowForward sx={{ ml: 1 }} />}
      </StyledButton>
    </FormContainer>
  );
};

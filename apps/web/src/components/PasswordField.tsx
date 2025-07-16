import { StyledTextField } from "@woovi-playground/ui";

interface PasswordFieldProps {
  password: string;
  setPassword: (password: string) => void;
  label?: string;
}

export const PasswordField = ({ 
  password, 
  setPassword, 
  label = "Senha" 
}: PasswordFieldProps) => {
  return (
    <StyledTextField
      label={label}
      type="password"
      fullWidth
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  );
};

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./Icons";

function PasswordInput({ value, onChange, placeholder, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="current-password"
        required
        {...props}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
      </button>
    </div>
  );
}

export default PasswordInput;
import React, { createContext, useContext } from "react";

const InputOTPContext = createContext({ value: "", onChange: () => {} });

export function InputOTP({ value = "", onChange, maxLength = 6, children, ...props }) {
  return (
    <InputOTPContext.Provider value={{ value, onChange, maxLength }}>
      <div className="flex justify-center" {...props}>
        {children}
      </div>
    </InputOTPContext.Provider>
  );
}

export function InputOTPGroup({ children }) {
  return <div className="flex gap-2">{children}</div>;
}

export function InputOTPSlot({ index }) {
  const { value, onChange, maxLength } = useContext(InputOTPContext);
  const digit = value[index] || "";

  return (
    <input
      aria-label={`Código ${index + 1}`}
      className="h-12 w-10 rounded-md border border-input bg-background text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring"
      inputMode="numeric"
      maxLength={1}
      value={digit}
      onChange={(event) => {
        const nextValue = event.target.value.replace(/\D/g, "");
        const nextCode = value.slice(0, index) + nextValue + value.slice(index + 1, maxLength);
        onChange(nextCode);
        if (nextValue) event.target.nextElementSibling?.focus();
      }}
      onKeyDown={(event) => {
        if (event.key === "Backspace" && !digit) event.target.previousElementSibling?.focus();
      }}
    />
  );
}

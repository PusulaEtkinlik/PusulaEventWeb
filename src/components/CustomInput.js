import React from "react";

// Refs ile dışarıdan kontrol edilebilen bir custom input
const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <input
    type="text"
    onClick={onClick}
    ref={ref}
    value={value}
    readOnly
    placeholder={placeholder}
    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
));

export default CustomInput;
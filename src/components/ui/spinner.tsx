import React from "react";
interface SpinnerProps {
  parentHeight?: string;
}
function Spinner({ parentHeight = "100vh" }: SpinnerProps) {
  return (
    <div
      style={{ height: parentHeight }}
      className="flex items-center justify-center"
    >
      <div className="w-10 h-10 border-primary border-8 rounded-full border-t-gray-200 animate-spin"></div>
    </div>
  );
}

export default Spinner;
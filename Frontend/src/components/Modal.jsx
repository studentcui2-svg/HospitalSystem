import React from "react";

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.4)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const Modal = ({ children, onClose }) => (
  <div style={modalStyle} onClick={onClose}>
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 16px #0002",
        minWidth: 300,
        maxWidth: 480,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

export default Modal;

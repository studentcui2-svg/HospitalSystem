exports.generateOTP = (digits = 4) => {
  let otp = "";
  for (let i = 0; i < digits; i++) otp += Math.floor(Math.random() * 10);
  console.log("[OTP GENERATOR] Generated OTP:", otp, `(${digits} digits)`);
  return otp;
};

// 📂 middlewares/validateDeposit.js
export const validateDeposit = (req, res, next) => {
  const { amount } = req.body;
  
  if (amount > 1000000000) { // Giới hạn 1 tỷ
    return res.status(400).json({
      success: false,
      message: 'Số tiền vượt quá giới hạn cho phép'
    });
  }
  
  next();
};

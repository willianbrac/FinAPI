export default {
  jwt: {
    secret: "senhasupersecreta123",
    // secret: process.env.JWT_SECRET as string,
    expiresIn: '1d'
  }
}

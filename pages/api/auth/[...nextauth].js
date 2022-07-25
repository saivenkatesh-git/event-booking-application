import NextAuth from "next-auth";
import Providers from "next-auth/providers";

const options = {
    providers: [
        Providers.Credentials({
            name:"Custom Provider",
            Credentials: {
                username:{label:"Email", type:"email"},
                password:{label:"Password", type:"password"}
            },
            authorize: async (credentials) => {
                // Do something with the credentials
                return {
                    id: credentials.username,
                    name: credentials.username,
                    email: credentials.username
                };
            }
        })
    ],
    session: {
        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: "1d"
        }
    }
};

export default (req , res) => NextAuth(req, res, options);
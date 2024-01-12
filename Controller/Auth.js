const bcrypt = require('bcrypt');
const User = require("../Models/User");
const jwt = require("jsonwebtoken");

require("dotenv").config()

// Sign up route handler
exports.signup = async (req, res) => {
    try {
        // get data
        const { name, email, password, role } = req.body;

        // check if user already exist 
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User Already Exists",
            })
        }

        // Secured password 
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                message: "Error in hashing password",
            })
        }

        // Create Entry for User
        let user = await User.create({
            name, email, password: hashedPassword, role
        });

        return res.status(200).json({
            success: true,
            message: "User Created Successfully",
            data: user
        });
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: "User cannot be register,Please try again later",
        })
    }
}

// Login 

exports.login = async (req, res) => {

    try {
        // data fetch
        const { email, password } = req.body;
        // validation on email and password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all the details carefully'
            });
        }

        // check for registered user
        const user = await User.findOne({ email });
        // if not a registered user
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User is not registered',
            });
        }

        const payload = {
            email: user.email,
            id: user._id,
            role: user.role,
        };
        //verify password & generate a JWT token
        if (await bcrypt.compare(password, user.password)) {
            // password matche
            let token = jwt.sign(payload,
                process.env.JWT_SECRET,
                {
                    expiresIn: "2h",
                });


            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }

            res.cookie("tanveerCookies", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "User Logged in Successfully",
            });

        }

        else {
            // password do not match 
            return res.status(403).json({
                success: false,
                message: "Password Incorrect",
            });
        }
    }

    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Login Failure',
        });
    }
}

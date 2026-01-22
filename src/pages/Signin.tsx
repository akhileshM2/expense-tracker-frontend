import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BottomWarning } from "../components/BottomWarning"
import { Button } from "../components/Button"
import { Heading } from "../components/Heading"
import { InputBox } from "../components/Inputbox"
import { SubHeading } from "../components/Subheading"
import axios from "axios"


export const Signin = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const navigate = useNavigate()

    return (<>
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col justify-center">
                <div className="rounded-lg bg-slate-300 w-80 text-center p-2 h-max px-4">
                    <Heading label={"Sign in"} />
                    <SubHeading label={"Enter your credentials to access your account"}/>
                    <InputBox type={"email"} onChange={(e: any) => {
                        setEmail(e.target.value)
                    }} placeholder={"johndoe@gmail.com"} label={"Email"} />
                    <InputBox type={"password"} onChange={(e: any) => {
                        setPassword(e.target.value)
                    }} placeholder={"12345678"} label={"Password"} />
                    <div className="pt-4">
                        <Button loading={loading} label={"Sign in"} onClick={async () => {
                            setLoading(true)
                            try {
                                const res = await axios.post("http://localhost:3000/api/v1/user/signin", {
                                    email,
                                    password
                                })
                                localStorage.setItem("token", res.data.token)
                                localStorage.setItem("name", res.data.name)
                                localStorage.setItem("email", res.data.email)
                                navigate("/dashboard")
                            } catch (err) {
                                console.error(err)
                                setError(true)
                            } finally {
                                setLoading(false)
                            }
                        }}/>
                    </div>
                    <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"}/>
                    {error ? ( <div className="text-red-600 font-semibold">Invalid email or password</div> ) : ("")}
                </div>
            </div>
        </div>
    </>)
}
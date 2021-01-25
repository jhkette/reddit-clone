import {FormEvent, useState} from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Axios from 'axios'
import { useRouter } from 'next/router'

export default function Register() {
   const [email, setEmail] = useState('')
   const [username, setUsername] = useState('')
   const [password, setPassword] = useState('')
   const [agreement, setAgreement] = useState(false)
   const [errors, setErrors] = useState<any>({})


   const submitForm = async (event: FormEvent) => {
     event.preventDefault()
  try{
     const res = await Axios.post('/auth/register', {
       email, password, username
     })
     console.log(res.data)
    } catch(err){
      console.log(err)
    }

   }
  return (
    <div className="flex">
      <Head>
        <title>Register</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className="w-40 h-screen bg-center bg-cover"
        style={{ backgroundImage: "url('/images/bricks.jpg')" }}
      ></div>
      <div className="flex flex-col justify-center pl-6">
        <div className="w-70">
          <h1 className="mb-2 text-lg font-medium">Sign Up</h1>
          <p className="mb-10 text-xs">
            By continuing, you agree to our User Agreement and Privacy Policy
          </p>
          <form onSubmit={submitForm}>
            <div className="mb-6">
              <input
                type="checkbox"
                className="mr-1 cursor-pointer"
                id="agreement"
                checked={agreement}
                onChange={e => setAgreement(e.target.checked)}
              />
              <label htmlFor="agreement" className="text-xs cursor-pointer">
                I agree to get emails about cool stuff on Readit
              </label>
            </div>
            <div className="mb-2">
              <input
                type="email"
                className="w-full px-3 py-2 transition duration-200 border border-gray-300 rounded outline-none bg-gray-50 focus:bg-white hover:bg-white"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <input
                type="text"
                className="w-full px-3 py-2 transition duration-200 border border-gray-300 rounded outline-none bg-gray-50 focus:bg-white hover:bg-white"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <input
                type="password"
                className="w-full px-3 py-2 transition duration-200 border border-gray-300 rounded outline-none bg-gray-50 focus:bg-white hover:bg-white"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button className="w-full py-2 mb-4 text-xs font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded">
              Sign Up
            </button>
          </form>
          <small>
            Already a readitor?
            <Link href="/login">
              <a className="ml-1 text-blue-500 uppercase">Log In</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  )
}
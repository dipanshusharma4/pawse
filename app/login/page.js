import React from 'react'

const page = () => {
  return (
    <div className='shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-sm mx-auto'>
    <h2 className="bg-gradient-to-r from-indigo-500 to-sky-400 px-8 py-8 text-white text-center">Login</h2>
    <form className="bg-white ">
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
            </label>
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Email"
                required
            />
        </div>
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
            </label>
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="********"
                required
            />
        </div>
        <div className="flex items-center justify-between">
            <button
                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
            >
                Sign In
            </button>
        </div>
    </form>
    <p className="text-center text-gray-500 text-xs">
        &copy;2024 Pawse. All rights reserved.
    </p>
    </div>
  )
}

export default page

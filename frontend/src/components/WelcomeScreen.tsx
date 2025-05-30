import { UsersIcon } from "@heroicons/react/24/outline"


const WelcomeScreen = () => {
  return (
     <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
            <div className="text-center text-gray-600 max-w-md px-4">
              <div className="relative mb-8 mx-auto w-48 h-48 bg-blue-100/30 rounded-full flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-200/30 to-indigo-200/30 animate-pulse"></div>
                <UsersIcon className="w-24 h-24 text-blue-400 animate-float" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome to ChatApp
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Start a conversation by selecting a contact or inviting a new
                friend to join.
              </p>
            </div>
          </div>
  )
}

export default WelcomeScreen
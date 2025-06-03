import { useState } from "react";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";
import { HiMail, HiUser } from "react-icons/hi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL:string = import.meta.env.VITE_BASE_URL;


const baseAuthSchema = z.object({
  firstName: z.string().min(2, "At least 2 characters").optional(),
  lastName: z.string().min(2, "At least 2 characters").optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Minimum 6 characters"),
});

const authSchema = baseAuthSchema.refine(
  (data) => {
    if (
      !data.firstName &&
      !data.lastName &&
      window.location.pathname === "/register"
    ) {
      return false;
    }
    return true;
  },
  {
    message: "Both names are required",
    path: ["firstName"],
  }
);

type AuthFormValues = z.infer<typeof authSchema>;

interface AuthFormProps {
  isLogin: boolean;
}
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: [] | {}
}
export default function AuthForm({ isLogin }: AuthFormProps) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<AuthFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    try {
      const validationSchema = isLogin
        ? baseAuthSchema.omit({ firstName: true, lastName: true })
        : authSchema;
      validationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      console.log(error);
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post<ApiResponse>(
          `${BASE_URL}/user/${isLogin ? "login" : "create"}`,
          formData,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          alert(response.data.message);
          console.log(response.data.data)
          navigate(`/chat/${response.data.data}`)
        }
      } catch (error) {
        console.log(error);
      }
    
    }
  };

  return (
    <div className="min-h-[600px] flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-white/20 backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="mb-3 flex justify-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">💬</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {isLogin ? "Welcome Back" : "Join ChatHub"}
          </h1>
          <p className="text-gray-600 text-sm">
            {isLogin ? "Sign in to continue" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  type="text"
                  className={`w-full px-3 py-2 text-sm bg-gray-50/50 border ${
                    errors.firstName ? "border-red-400" : "border-gray-200"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-gray-400`}
                  placeholder="First name"
                />
                <HiUser className="absolute right-2 top-2.5 text-gray-400 text-sm" />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1 ml-1 animate-slide-down">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="relative">
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  type="text"
                  className={`w-full px-3 py-2 text-sm bg-gray-50/50 border ${
                    errors.lastName ? "border-red-400" : "border-gray-200"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-gray-400`}
                  placeholder="Last name"
                />
                <HiUser className="absolute right-2 top-2.5 text-gray-400 text-sm" />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1 ml-1 animate-slide-down">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="relative">
            <input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              type="email"
              className={`w-full px-3 py-2 text-sm bg-gray-50/50 border ${
                errors.email ? "border-red-400" : "border-gray-200"
              } rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-gray-400`}
              placeholder="Email address"
            />
            <HiMail className="absolute right-2 top-2.5 text-gray-400 text-sm" />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-1 animate-slide-down">
                {errors.email}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              type={showPassword ? "text" : "password"}
              className={`w-full px-3 py-2 text-sm bg-gray-50/50 border ${
                errors.password ? "border-red-400" : "border-gray-200"
              } rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-gray-400`}
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-purple-600 transition-colors"
            >
              {showPassword ? (
                <FaEyeSlash className="w-4 h-4" />
              ) : (
                <FaEye className="w-4 h-4" />
              )}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1 animate-slide-down">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 hover:shadow-md"
          >
            {isLogin ? "Sign In →" : "Create Account →"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 text-xs">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-4 flex gap-2 justify-center">
            <button className="p-2 bg-white border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50/50 transition-all">
              <FcGoogle className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white border border-gray-200 rounded-lg hover:border-gray-800 hover:bg-gray-50 transition-all">
              <FaGithub className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-gray-600 text-xs">
          {isLogin ? (
            <>
              New here?{" "}
              <a
                href="/register"
                className="text-purple-600 hover:text-purple-700 font-medium underline-offset-2 hover:underline"
              >
                Create account
              </a>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <a
                href="/login"
                className="text-purple-600 hover:text-purple-700 font-medium underline-offset-2 hover:underline"
              >
                Sign in
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

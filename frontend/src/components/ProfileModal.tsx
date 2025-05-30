import { XMarkIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import type { ProfileModalProps } from '../types/types';



const ProfileModal: React.FC<ProfileModalProps> = ({
  showProfileModal,
  setShowProfileModal,
//   profileName,
//   setProfileName,
//   profileEmail,
//   setProfileEmail,
//   profileAvatar,
//   setProfileAvatar,
userDetails,
setUserDetails,
  handleUpdateProfile,
  handleImageUpload,
}) => {
  return (
    showProfileModal && (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md shadow-2xl transform transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Your Profile</h3>
            <button
              onClick={() => setShowProfileModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={userDetails.avatar}
                alt={userDetails.firstName + " "+ userDetails.lastName}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{userDetails.firstName + " "+ userDetails.lastName}</h4>
                <p className="text-sm text-gray-600">{userDetails.email}</p>
                <p className="text-sm text-teal-500 font-medium">Online</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={userDetails.firstName + " "+ userDetails.lastName}
                //   onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userDetails.email}
                //   onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                <input
                  type="text"
                  value={userDetails.avatar}
                //   onChange={(e) => setProfileAvatar(e.target.value)}
                  placeholder="Enter avatar URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Profile Picture</label>
                <label className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-center bg-white hover:bg-gray-50 cursor-pointer transition-all">
                  <PaperClipIcon className="w-6 h-6 text-gray-600 mr-2" />
                  <span className="text-sm text-gray-600">Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <button
                onClick={handleUpdateProfile}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ProfileModal;
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

const ProfileModal = ({
  showProfileModal,
  setShowProfileModal,
  userDetails,
  setUserDetails,
  handleUpdateProfile,
  handleImageUpload,
}) => {
  return (
    showProfileModal && (
      <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all border border-gray-100">
          <div className="flex justify-between items-center mb-6 pb-2">
            <h3 className="text-xl font-semibold text-gray-800">Profile Settings</h3>
            <button
              onClick={() => setShowProfileModal(false)}
              className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative group mb-4">
                <div className="relative rounded-full bg-gray-100 border-2 border-dashed border-gray-300 w-24 h-24 flex items-center justify-center overflow-hidden">
                  {userDetails?.avatar ? (
                    <img 
                      src={userDetails.avatar} 
                      alt={`${userDetails.firstName} ${userDetails.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-full w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-2xl font-bold">
                        {userDetails?.firstName?.charAt(0)}
                        {userDetails?.lastName?.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-blue-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <CloudArrowUpIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <label className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-medium text-blue-600 shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  Update Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Form Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={userDetails?.firstName || ''}
                    onChange={(e) => setUserDetails({ ...userDetails , firstName: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={userDetails?.lastName || ''}
                    onChange={(e) => setUserDetails({ ...userDetails, lastName: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-800 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userDetails?.email || ''}
                  onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-800 text-sm"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between">
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="py-2.5 px-5 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ProfileModal;
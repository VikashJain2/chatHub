import { XMarkIcon } from '@heroicons/react/24/outline';


const LogoutModal = ({ showLogoutModal, setShowLogoutModal, handleLogout }) => {
  return (
    showLogoutModal && (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md shadow-2xl transform transition-all animate-scale-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Log Out</h3>
            <button
              onClick={() => setShowLogoutModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">Are you sure you want to log out?</p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default LogoutModal;
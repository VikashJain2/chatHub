import { XMarkIcon, EnvelopeIcon, LinkIcon } from '@heroicons/react/24/outline';
import type { InviteModalProps, User } from '../types/types';

const InviteModal: React.FC<InviteModalProps> = ({
  showInviteModal,
  setShowInviteModal,
  inviteInput,
  setInviteInput,
  invitationLink,
  setInvitationLink,
  invitationSent,
  setInvitationSent,
  filteredUsers,
  handleSendInvitation,
  generateInvitationLink,
  copyToClipboard,
  setIsSidebarOpen,
  handleSearchUser,
}) => {
  return (
    showInviteModal && (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md shadow-2xl transform transition-all animate-scale-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Invite a Friend</h3>
            <button
              onClick={() => {
                setShowInviteModal(false);
                setInvitationLink('');
                setInviteInput('');
                setInvitationSent(false);
                setIsSidebarOpen(false);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <div className="space-y-6">
            <input
              type="text"
              value={inviteInput}
              onChange={handleSearchUser}
              placeholder="Search user or enter email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400 text-sm sm:text-base"
              disabled={invitationSent}
            />
            {invitationSent ? (
              <div className="bg-teal-50 p-4 rounded-lg flex items-center gap-3 animate-pulse">
                <EnvelopeIcon className="w-6 h-6 text-teal-600" />
                <span className="text-sm font-medium text-teal-600">Invitation sent to {inviteInput}!</span>
              </div>
            ) : invitationLink ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <LinkIcon className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">Invitation Link</span>
                </div>
                <div className="flex gap-3">
                  <input
                    value={invitationLink}
                    readOnly
                    className="flex-1 text-sm p-3 bg-white border border-gray-300 rounded-lg truncate text-gray-900"
                  />
                  <button
                    onClick={() => copyToClipboard(invitationLink)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-white">
                    {filteredUsers.map((user: User) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar || `https://i.pravatar.cc/150?img=1}`}
                            alt={user.firstName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {user.firstName.charAt(0).toUpperCase() +
                                user.firstName.slice(1).toLowerCase() +
                                ' ' +
                                user.lastName.charAt(0).toUpperCase() +
                                user.lastName.slice(1).toLowerCase()}
                            </span>
                            <span className="text-sm font-semibold text-gray-700">
                              {user.email}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendInvitation(user)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                        >
                          Invite
                        </button>
                      </div>
                    ))}
                  </div>
                ) : inviteInput.trim() ? (
                  <button
                    onClick={generateInvitationLink}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    Generate Invitation Link
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default InviteModal;
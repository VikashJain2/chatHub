
import { EnvelopeIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { NotificationModalProps } from '../types/types'

const NotificationModal = ({setShowNotifications, notifications,handleAcceptInvitation,copyToClipboard,deleteNotification}:NotificationModalProps) => {
  return (
     <div className="md:absolute md:top-12 md:right-0 fixed inset-0 md:inset-auto md:w-96 bg-white md:border md:border-gray-200 rounded-xl md:shadow-2xl z-50 md:max-h-96 md:overflow-y-auto animate-fade-in-up flex flex-col">
                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-5 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {notification.type === "sent" &&
                              `Sent invitation to ${
                                notification.firstName +
                                " " +
                                notification.lastName
                              }`}
                            {notification.type === "received" &&
                              `Received invitation from ${
                                notification.firstName +
                                " " +
                                notification.lastName
                              }`}
                            {notification.type === "accepted" &&
                              `${
                                notification.firstName +
                                " " +
                                notification.lastName
                              } accepted your invitation`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          {notification.timestamp}
                        </p>
                        <div className="flex gap-2 items-center flex-wrap">
                          {notification.type === "received" && (
                            <button
                              onClick={() =>
                                handleAcceptInvitation(notification)
                              }
                              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all"
                            >
                              Accept
                            </button>
                          )}
                          {notification.link && (
                            <>
                              <input
                                value={notification.link}
                                readOnly
                                className="flex-1 text-xs p-2 bg-gray-100 border border-gray-300 rounded-lg truncate text-gray-900"
                              />
                              <button
                                onClick={() =>
                                  copyToClipboard(notification.link!)
                                }
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                              >
                                Copy
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-5 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
  )
}

export default NotificationModal
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import routeStarCustomerService from '../../services/routeStarCustomerService';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { ArrowLeftIcon, UserIcon, MapPinIcon, CreditCardIcon, DocumentTextIcon, WrenchIcon, TruckIcon } from '@heroicons/react/24/outline';

const RouteStarCustomerDetail = () => {
  const { customerId } = useParams();
  const { showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const response = await routeStarCustomerService.getCustomerById(customerId);
      console.log('Customer detail response:', response);

      // The axios interceptor already extracts response.data
      setCustomer(response || null);
    } catch (error) {
      console.error('Error loading customer:', error);
      showError('Failed to load customer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Customer not found
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'details', name: 'Details', icon: UserIcon },
    { id: 'contacts', name: 'Contacts', icon: UserIcon, count: customer.contacts?.length },
    { id: 'equipment', name: 'Equipment', icon: WrenchIcon, count: customer.equipment?.length },
    { id: 'routes', name: 'Routes', icon: TruckIcon, count: customer.routes?.length },
    { id: 'notes', name: 'Notes', icon: DocumentTextIcon, count: customer.notes?.length },
    { id: 'activities', name: 'Activities', icon: DocumentTextIcon, count: customer.activities?.length },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/routestar/customers"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.customerName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Customer ID: {customer.customerId}
            </p>
          </div>
        </div>
        <Badge variant={customer.active ? 'success' : 'secondary'} size="lg">
          {customer.active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CreditCardIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Account Balance</div>
                <div className={`text-xl font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${parseFloat(customer.balance || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <UserIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Customer Type</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {customer.customerType || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <MapPinIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Zone</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {customer.zone || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
                {tab.count !== undefined && (
                  <Badge variant="secondary" size="sm">
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                <dl className="space-y-3">
                  {customer.company && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{customer.company}</dd>
                    </div>
                  )}
                  {customer.contact && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{customer.contact}</dd>
                    </div>
                  )}
                  {customer.email && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{customer.email}</dd>
                    </div>
                  )}
                  {customer.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{customer.phone}</dd>
                    </div>
                  )}
                  {customer.salesRep && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sales Rep</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{customer.salesRep}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </Card>

            {/* Service Address */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Service Address
                </h3>
                <address className="not-italic text-sm text-gray-900 dark:text-white space-y-1">
                  {customer.serviceAddress1 && <div>{customer.serviceAddress1}</div>}
                  {customer.serviceAddress2 && <div>{customer.serviceAddress2}</div>}
                  {customer.serviceAddress3 && <div>{customer.serviceAddress3}</div>}
                  {(customer.serviceCity || customer.serviceState || customer.serviceZip) && (
                    <div>
                      {[customer.serviceCity, customer.serviceState, customer.serviceZip].filter(Boolean).join(', ')}
                    </div>
                  )}
                </address>
                {(customer.latitude || customer.longitude) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm space-y-2">
                      {customer.latitude && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-500 dark:text-gray-400">Latitude:</span>
                          <span className="text-gray-900 dark:text-white font-mono">{customer.latitude}</span>
                        </div>
                      )}
                      {customer.longitude && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-500 dark:text-gray-400">Longitude:</span>
                          <span className="text-gray-900 dark:text-white font-mono">{customer.longitude}</span>
                        </div>
                      )}
                      {customer.latitude && customer.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mt-2"
                        >
                          <MapPinIcon className="h-4 w-4" />
                          View on Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Billing Address */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Billing Address
                </h3>
                <address className="not-italic text-sm text-gray-900 dark:text-white space-y-1">
                  {customer.billingAddress1 && <div>{customer.billingAddress1}</div>}
                  {customer.billingAddress2 && <div>{customer.billingAddress2}</div>}
                  {customer.billingAddress3 && <div>{customer.billingAddress3}</div>}
                  {(customer.billingCity || customer.billingState || customer.billingZip) && (
                    <div>
                      {[customer.billingCity, customer.billingState, customer.billingZip].filter(Boolean).join(', ')}
                    </div>
                  )}
                </address>
              </div>
            </Card>

            {/* Account Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Account Information
                </h3>
                <dl className="space-y-3">
                  {customer.accountNumber && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Number</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{customer.accountNumber}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance</dt>
                    <dd className={`mt-1 text-sm font-semibold ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${parseFloat(customer.balance || 0).toFixed(2)}
                    </dd>
                  </div>
                  {customer.creditLimit && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Credit Limit</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        ${parseFloat(customer.creditLimit).toFixed(2)}
                      </dd>
                    </div>
                  )}
                  {customer.terms && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Terms</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{customer.terms}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'contacts' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Additional Contacts
              </h3>
              {customer.contacts && customer.contacts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Notify By</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {customer.contacts.map((contact, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{contact.contactName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{contact.notifyBy}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{contact.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{contact.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">No additional contacts</div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'equipment' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Equipment
              </h3>
              {customer.equipment && customer.equipment.length > 0 ? (
                <div className="space-y-4">
                  {customer.equipment.map((item, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</div>
                          <div className="text-sm text-gray-900 dark:text-white">{item.equipmentType}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</div>
                          <div className="text-sm text-gray-900 dark:text-white">{item.description || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Serial Number</div>
                          <div className="text-sm text-gray-900 dark:text-white">{item.serialNumber || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">No equipment found</div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'routes' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Routes
              </h3>
              {customer.routes && customer.routes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Route Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Frequency</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {customer.routes.map((route, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{route.routeName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{route.frequency}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{route.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">No routes found</div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'notes' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notes
              </h3>
              {customer.notes && customer.notes.length > 0 ? (
                <div className="space-y-4">
                  {customer.notes.map((note, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-900 dark:text-white mb-2">{note.noteText}</div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>By: {note.createdBy || 'Unknown'}</span>
                        <span>{note.createdDate ? new Date(note.createdDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">No notes found</div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'activities' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Activities
              </h3>
              {customer.activities && customer.activities.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {customer.activities.map((activity, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {activity.activityDate ? new Date(activity.activityDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{activity.activityType}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{activity.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {activity.amount ? `$${parseFloat(activity.amount).toFixed(2)}` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">No activities found</div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RouteStarCustomerDetail;

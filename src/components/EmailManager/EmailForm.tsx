import React from 'react';
import { MessageSquare, Edit, Mail } from 'lucide-react';
import { EMAIL_TEMPLATES } from '../../services/emailService';

interface EmailFormProps {
  selectedTemplate: keyof typeof EMAIL_TEMPLATES;
  onTemplateChange: (template: keyof typeof EMAIL_TEMPLATES) => void;
  customSubject: string;
  onSubjectChange: (subject: string) => void;
  customMessage: string;
  onMessageChange: (message: string) => void;
  useCustomMessage: boolean;
  onUseCustomChange: (use: boolean) => void;
  disabled: boolean;
}

export default function EmailForm({
  selectedTemplate,
  onTemplateChange,
  customSubject,
  onSubjectChange,
  customMessage,
  onMessageChange,
  useCustomMessage,
  onUseCustomChange,
  disabled
}: EmailFormProps) {
  const templateOptions = [
    { key: 'orderConfirmation', label: 'Confirmation de commande', icon: '✅' },
    { key: 'paymentReminder', label: 'Rappel de paiement', icon: '💰' },
    { key: 'deliveryReady', label: 'Commande prête', icon: '📦' }
  ] as const;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
        Configuration de l'email
      </h3>

      {/* Toggle message personnalisé */}
      <div className="flex items-center space-x-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={useCustomMessage}
            onChange={(e) => onUseCustomChange(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Message personnalisé
        </span>
      </div>

      {!useCustomMessage ? (
        /* Sélection de template */
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Template d'email
          </label>
          <div className="grid grid-cols-1 gap-3">
            {templateOptions.map((option) => (
              <label
                key={option.key}
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate === option.key
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="template"
                  value={option.key}
                  checked={selectedTemplate === option.key}
                  onChange={(e) => onTemplateChange(e.target.value as keyof typeof EMAIL_TEMPLATES)}
                  disabled={disabled}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {EMAIL_TEMPLATES[option.key].subject}
                    </div>
                  </div>
                </div>
                {selectedTemplate === option.key && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>
      ) : (
        /* Message personnalisé */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              Sujet de l'email
            </label>
            <input
              type="text"
              value={customSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              disabled={disabled}
              placeholder="Sujet de votre email..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Edit className="h-4 w-4 inline mr-1" />
              Message personnalisé
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              disabled={disabled}
              rows={12}
              placeholder="Votre message personnalisé..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white disabled:opacity-50"
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Variables disponibles : {'{'}{'{'}customerName{'}'}{'}'}, {'{'}{'{'}orderNumber{'}'}{'}'}, {'{'}{'{'}orderDate{'}'}{'}'}, {'{'}{'{'}productsList{'}'}{'}'}, {'{'}{'{'}totalAmount{'}'}{'}'}, {'{'}{'{'}paymentStatus{'}'}{'}'}, {'{'}{'{'}emailFooter{'}'}{'}'}, {'{'}{'{'}emailHeader{'}'}{'}'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import ResetPasswordForm from './components/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Nouveau mot de passe
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entrez votre nouveau mot de passe
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}

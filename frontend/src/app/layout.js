import './globals.css';

export const metadata = {
  title: 'CLMS Mobile App',
  description: 'Manage and track your central laundry needs easily.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

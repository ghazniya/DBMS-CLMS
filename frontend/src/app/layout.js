import './globals.css';

export const metadata = {
  title: 'Hostel Laundry Management',
  description: 'Manage and track your hostel laundry needs easily.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

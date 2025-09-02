interface ToolbarItemProps {
  title: string;
  subtitle?: string;
  value: React.ReactNode;
}

export function ToolbarItem({ title, subtitle, value }: ToolbarItemProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 130,
      margin: '0 10px',
      padding: '4px 0',
      background: 'rgba(34, 100, 62, 0.49)',
      border: '2.8px solidrgba(1, 50, 32, 0.74)',
      color: '#fff',
      fontFamily: 'Press Start 2P, monospace',
      fontSize: 13,
      boxShadow: '0 1.8px 7.2px 0 rgba(20,83,45,0.13)',
      letterSpacing: '1px',
    }}>
      <span style={{ fontSize: 15, fontWeight: 500, marginBottom: 1.3, color: '#fff', textDecoration: 'underline', textUnderlineOffset: '2px', textShadow: '0 1px 2px #013220' }}>{title}</span>
      {subtitle && (
        <span style={{ fontSize: 14, fontWeight: 400, marginBottom: 1.3, color: '#fff', textShadow: '0 1px 2px #013220' }}>{subtitle}</span>
      )}
      <span style={{ fontSize: 16, fontWeight: 500, color: '#fff', textShadow: '0 1px 2px #013220' }}>{value}</span>
    </div>
  );
}

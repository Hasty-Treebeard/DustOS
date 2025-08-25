interface ForcefieldData {
  owner: string;              // Owner of the forcefield
  entityId: string;           // Entity ID of the forcefield
  fragments: number;          // Number of fragments (size)
  energy: string;             // Current energy (formatted string)
  drainRate: string;          // Energy drain rate (formatted string)
  daysRemaining: string;      // Days remaining (formatted string)
}

interface ForcefieldPanelProps {
  forcefieldData: ForcefieldData | null;
  isInsideForcefield: boolean;
}

export function ForcefieldPanel({ forcefieldData, isInsideForcefield }: ForcefieldPanelProps) {
  if (!isInsideForcefield || !forcefieldData) {
    return (
      <div style={{
        background: 'rgba(6, 51, 19, 0.7)',
        padding: '20px 30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        boxShadow: '0 2.7px 10.8px 0 rgba(56,161,105,0.18)',
        fontFamily: 'Press Start 2P, monospace',
        imageRendering: 'pixelated',
        borderRadius: '0',
        zIndex: 999,
        width: '200px',
        height: '120px',
      }}>
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: '5px',
          color: 'rgb(174, 255, 208)',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          textShadow: '0 1px 2px #013220',
          alignSelf: 'flex-start',
          width: '100%',
        }}>
          Forcefield:
        </div>
        <div style={{
          color: '#fff',
          fontSize: 14,
          textAlign: 'left',
          marginTop: '5px',
        }}>
          Enter a forcefield to view details
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(6, 51, 19, 0.7)',
      padding: '20px 30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      boxShadow: '0 2.7px 10.8px 0 rgba(56,161,105,0.18)',
      fontFamily: 'Press Start 2P, monospace',
      imageRendering: 'pixelated',
      borderRadius: '0',
      zIndex: 999,
      width: '200px',
      minHeight: '200px',
    }}>
      <div style={{
        fontSize: 20,
        fontWeight: 700,
        marginBottom: '5px',
        color: 'rgb(174, 255, 208)',
        textDecoration: 'underline',
        textUnderlineOffset: '3px',
        textShadow: '0 1px 2px #013220',
        alignSelf: 'flex-start',
        width: '100%',
      }}>
        Forcefield:
      </div>
      
      <div style={{ margin: '3px 0', color: '#fff', fontSize: 14, width: '100%' }}>
        <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Owner:</span> {forcefieldData.owner === 'Unknown' ? 'Unknown' : forcefieldData.owner}
      </div>
      <div style={{ margin: '3px 0', color: '#fff', fontSize: 14, width: '100%' }}>
        <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Entity ID:</span> {forcefieldData.entityId}
      </div>
      <div style={{ margin: '3px 0', color: '#fff', fontSize: 14, width: '100%' }}>
        <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Fragments:</span> {forcefieldData.fragments}
      </div>
      <div style={{ margin: '3px 0', color: '#fff', fontSize: 14, width: '100%' }}>
        <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Energy:</span> {forcefieldData.energy}
      </div>
      <div style={{ margin: '3px 0', color: '#fff', fontSize: 14, width: '100%' }}>
        <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Drain Rate:</span> {forcefieldData.drainRate}
      </div>
      <div style={{ margin: '3px 0', color: '#fff', fontSize: 14, width: '100%' }}>
        <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Days Remaining:</span> {forcefieldData.daysRemaining}
      </div>
    </div>
  );
}

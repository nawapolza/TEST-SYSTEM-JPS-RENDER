export default function BrandMark({ compact = false, className = '', label = 'TEST SYSTEM — JPS' }) {
  return <img src="/jps-logo.png" alt={label} className={`${compact ? 'h-11 w-11' : 'h-14 w-14'} inline-block object-contain ${className}`} />;
}

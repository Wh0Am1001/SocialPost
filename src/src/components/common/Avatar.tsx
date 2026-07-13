interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-20 h-20 text-2xl',
};

export default function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0 ring-1 ring-black/5`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-brand-500 text-white flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {initial}
    </div>
  );
}

import './PatronusButton.css'

export default function PatronusButton({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  fullWidth = false,
  className = '',
  icon = null,
  type = 'button',
  disabled = false,
  onClick,
  ...props
}) {
  const classes = [
    'patronus-button',
    `patronus-button--${variant}`,
    `patronus-button--${size}`,
    fullWidth ? 'patronus-button--full-width' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="patronus-button__icon">{icon}</span>}
      <span className="patronus-button__content">{children}</span>
    </button>
  )
}

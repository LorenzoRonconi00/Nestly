export function CrayonFilters() {
    return (
        <svg aria-hidden="true" focusable="false" width="0" height="0" className="pointer-events-none absolute">
            <defs>
                <filter id="crayon" x="-4%" y="-12%" width="108%" height="124%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="warp" />
                    <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="wobbly" />
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" result="grain" />
                    <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -0.75" result="speckle" />
                    <feComposite in="wobbly" in2="speckle" operator="in" />
                </filter>
                <filter id="crayon-soft" x="-4%" y="-60%" width="108%" height="220%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="2" result="warp" />
                    <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="wobbly" />
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" result="grain" />
                    <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.6 0 0 0 -0.3" result="speckle" />
                    <feComposite in="wobbly" in2="speckle" operator="in" />
                </filter>
            </defs>
        </svg>
    );
}
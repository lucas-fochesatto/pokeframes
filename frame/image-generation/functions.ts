import { Attack } from "../types/types";

export const moves = (attackName: string) => {
    return `
			<svg width="220" height="65">
				<text x="0" y="25" text-anchor="left" font-family="Handjet" font-size="27" fill="white">${attackName}</text>
			</svg>
		`;
};

export const moves2 = (attackName: string) => {
    return `
			<svg width="220" height="65">
				<text x="0" y="25" text-anchor="left" font-family="Handjet" font-size="22" fill="white">${attackName}</text>
			</svg>
		`;
};

export const typeBox = (attackType: Attack) => {
    return `
            <svg width="98" height="36">
            	<rect width="98" height="36" fill="${attackType.type.color}"/>
            </svg>
        `;
};

export const typeBox2 = (attackType: Attack) => {
    return `
            <svg width="104" height="40" fill="none">
                <rect width="104" height="40" rx="20" fill="${attackType.type.color}"/>
            </svg>
        `;
};

export const attackType = (attackType: Attack) => {
    return `
        <svg width="400" height="40">
            <text x="50" y="25" text-anchor="middle" font-family="Handjet" font-weight="bold" font-size="20" fill="white">${attackType.type.name.toUpperCase()}</text>
        </svg>
        `;
};

export const statusPokemon = (statusPoints: string) => {
    return `
           <svg width="100" height="45">
            <text x="0" y="20" text-anchor="left" font-family="Handjet" font-size="20" fill="white">+${statusPoints}</text>
           </svg>       

        `;
};

export const hpSVG = (currentHp: number, totalHp: number) => {
    const hpBarSize = 160;
    const hpWidth = (currentHp / totalHp) * hpBarSize;
    return `
            <svg width="194" height="29" fill="none">
				<rect x="1.5" y="5.5" width="191" height="19" rx="9.5" fill="#1D1A28" stroke="#1D1A28" stroke-width="3"/>
				<rect x="27.5" y="5.5" width="${hpWidth}" height="19" rx="9.5" fill="url(#paint0_linear_716_93)" stroke="#1D1A28" stroke-width="3"/>
				<path d="M8.99941 18.6912V17.3676V16.0441V14.7206V13.3971V12.0735V10.75V9.42647V8.10294H10.3229H11.6465V9.42647V10.75V12.0735V13.3971V14.7206V16.0441V17.3676V18.6912V20.0147V21.3382H10.3229H8.99941M8.99941 21.3382V22.6618V17.3676V16.0441V14.7206V13.3971V12.0735V10.75V9.42647V8.10294V6.77941H10.3229H11.6465V8.10294V9.42647V10.75V12.0735V13.3971V14.7206V16.0441V17.3676V18.6912V20.0147V21.3382V22.6618H10.3229H8.99941M14.2935 18.6912V17.3676V16.0441V14.7206V13.3971V12.0735V10.75V9.42647V8.10294H15.6171H16.9406V9.42647V10.75V12.0735V13.3971V14.7206V16.0441V17.3676V18.6912V20.0147V21.3382H15.6171H14.2935M14.2935 21.3382V22.6618V17.3676V16.0441V14.7206V12.0735V10.75V9.42647V8.10294V6.77941H15.6171H16.9406V8.10294V9.42647V10.75V12.0735V13.3971V14.7206V16.0441V17.3676V18.6912V20.0147V21.3382V22.6618H15.6171H14.2935M14.2935 13.3971V14.7206V16.0441H12.97H11.6465V14.7206V13.3971M10.3229 16.0441V14.7206V13.3971H11.6465H15.6171V14.7206V16.0441H12.97H11.6465H10.3229ZM18.7219 18.6912V17.3676V16.0441V14.7206V13.3971V12.0735V10.75V9.42647V8.10294H20.0454H21.3689V9.42647V10.75V12.0735V13.3971V14.7206V16.0441V17.3676V18.6912V20.0147V21.3382H20.0454H18.7219M22.6925 6.77941V8.10294V9.42647H21.3689H20.0454V8.10294V6.77941M24.016 6.77941V8.10294H25.3395H26.663V9.42647V10.75V12.0735V13.3971V14.7206V16.0441H25.3395H24.016V17.3676H22.6925H21.3689V16.0441V14.7206H24.016V13.3971V12.0735V10.75V9.42647H22.6925V8.10294M18.7219 21.3382V22.6618V17.3676V16.0441V14.7206V13.3971V12.0735V10.75V9.42647V8.10294V6.77941H20.0454H25.3395V8.10294V9.42647H26.663V10.75V12.0735V13.3971V14.7206H25.3395V16.0441V17.3676H24.016H22.6925H21.3689L20.0454 16.0441V14.7206H21.3689H24.016V13.3971V12.0735V10.75V9.42647H22.6925H21.3689V10.75V12.0735V13.3971V14.7206V16.0441V17.3676V18.6912V20.0147V21.3382V22.6618H20.0454H18.7219" fill="url(#paint1_linear_716_93)"/>
				<defs>
					<linearGradient id="paint0_linear_716_93" x1="110" y1="26" x2="110" y2="4" gradientUnits="userSpaceOnUse">
						<stop stop-color="${hpWidth < 46 ? "#B71111" : "#76ED89"}"/>
						<stop offset="1" stop-color="${hpWidth < 46 ? "#F50303" : "#6DC99B"}"/>
					</linearGradient>
					<linearGradient id="paint1_linear_716_93" x1="17.5" y1="0" x2="17.5" y2="29" gradientUnits="userSpaceOnUse">
						<stop stop-color="#FDDA69"/>
						<stop offset="1" stop-color="#FBBC41"/>
					</linearGradient>
				</defs>
            </svg>
        `;
};

function prettyName(inputString: string): string {
    let upperString = inputString.toUpperCase();
    return upperString;
}

export const pokemonSVG = (pokemonName: string) => {
    return `
            <svg width="165" height="45">
            	<text x="0" y="25" text-anchor="left" font-family="Arial" font-size="20" fill="white" font-weight="bold">${prettyName(pokemonName)}</text>
            </svg>
      `;
};

export const hpHp = (currentHp: number, totalHp: number) => {
    return `
                <svg width="80" height="45">
                	<text x="0" y="25" text-anchor="left" font-family="Arial" font-size="22" fill="white">${currentHp}/${totalHp}</text>
                </svg>
          `;
};

'use client';
import StaggeredMenu from './StaggeredMenu';

const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
    { label: 'VibeMarket', ariaLabel: 'Cards marketplace', link: 'https://vibechain.com/market?ref=B3FLA1AGGOH2' },
    { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
    { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' },
];

const socialItems = [
    { label: 'Twitter', link: 'https://x.com/scream_vision' },
    { label: 'Farcaster', link: 'https://farcaster.xyz/screamvision' },
    { label: 'Linktree', link: 'https://linktr.ee/screamvision' },
];

export default function Header() {
    return (
        <StaggeredMenu
            position="right"
            items={menuItems}
            socialItems={socialItems}
            displaySocials={true}
            displayItemNumbering={true}
            menuButtonColor="#fff"
            openMenuButtonColor="#000"
            changeMenuColorOnOpen={true}
            colors={['#B19EEF', '#5227FF']}
            logoUrl="/logo.svg"         // положи свой логотип в public/logo.svg или поменяй путь
            accentColor="#ff6b6b"
            isFixed={true}              // ВАЖНО: поверх контента, без отступов
            onMenuOpen={() => { }}
            onMenuClose={() => { }}
        />
    );
}

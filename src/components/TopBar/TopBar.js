import React from 'react';
import './TopBar.css';

function TopBar() {
    return (
        <div className='Profile-Baba-Logo'>
            <img className='profile-baba-image' src='https://profilebaba.com/public/image/logo.png' alt='profile-baba-logo' />
            <div>
                <span className='title-profile'>Profile</span>
                <span className='title-baba'>Baba</span>
                <span className='short-title'>(Shop Extracter)</span>
            </div>
        </div>
    )
}

export default TopBar

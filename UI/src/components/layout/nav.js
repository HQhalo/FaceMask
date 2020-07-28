import React from 'react';
import './nav.css'
const Nav = () => {
    return (
        <nav className='navBar'>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="object">Object Detection</a></li>
                <li><a href="/myobject">My Object</a></li>
            </ul>
        </nav>
    );
}
 
export default Nav;
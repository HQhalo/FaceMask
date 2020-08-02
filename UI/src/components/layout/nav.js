import React from 'react';
import './nav.css'
const Nav = () => {
    return (
        <nav className='navBar'>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="object">YOLOv3</a></li>
                <li><a href="/myobject">Face Mask</a></li>
            </ul>
        </nav>
    );
}
 
export default Nav;
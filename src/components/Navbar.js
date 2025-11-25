import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, LogOut, User, ChevronDown, PlusCircle } from 'lucide-react';
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(
        typeof window !== 'undefined' && !!localStorage.getItem('token')
    );
    const [userInfo, setUserInfo] = useState({ name: '', photo: '' });

    const updateAuthStatus = () => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        if (token) {
            setUserInfo({
                name: localStorage.getItem('user_name') || 'User',
                photo: localStorage.getItem('user_photo') || ''
            });
        }
    };

    useEffect(() => {
        updateAuthStatus();
        window.addEventListener('storage', updateAuthStatus);
        window.addEventListener('authChange', updateAuthStatus);
        return () => {
            window.removeEventListener('storage', updateAuthStatus);
            window.removeEventListener('authChange', updateAuthStatus);
        };
    }, []);

    const handleLogout = () => {
        navigate('/logout');
    };


    const isEditor = location.pathname.includes('/survey/create') || location.pathname.includes('/survey/edit');

    const triggerAddQuestion = (type) => {
        const event = new CustomEvent('add-question-event', { detail: { type } });
        window.dispatchEvent(event);
    };

    return (
        <nav className="w-full px-8 h-16 z-50 absolute top-0 left-0 bg-transparent border-none">
            <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">


                <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                    <img src="/favicon.ico" alt="Home" className="w-8 h-8 object-contain" />
                </Link>


                <div className="flex-1"></div>

                {/* --- RIGHT: CONTEXTUAL TOOLS --- */}
                <div className="flex items-center gap-4">

                    {/* CASE 1: ANONYMOUS USER */}
                    {!isAuthenticated && (
                        <Link to="/login">
                            <Button variant="ghost"  className=" bg-[#778DA9] text-[var(--color-primary)] hover:bg-gray-100">
                                LOG IN
                            </Button>
                        </Link>
                    )}

                    {/* CASE 2: LOGGED IN USER */}
                    {isAuthenticated && (
                        <>
                            {/* SUB-CASE A: SURVEY EDITOR MODE */}
                            {isEditor ? (
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] gap-2">
                                            <PlusCircle size={16} />
                                            ADD QUESTION
                                            <ChevronDown size={14} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Question Type</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => triggerAddQuestion('multiple_choice')}>
                                            Multiple Choice (Default)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => triggerAddQuestion('checkbox')}>
                                            Checkbox
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => triggerAddQuestion('short_answer')}>
                                            Short Answer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (

                                <Link to="/survey/create">
                                    <Button className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] gap-2">
                                        <Plus size={16} />
                                        CREATE SURVEY
                                    </Button>
                                </Link>
                            )}


                            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-300">
                                <span className="text-sm font-medium text-gray-700 hidden md:block">
                                    Welcome, {userInfo.name}
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Avatar className="cursor-pointer hover:opacity-80 transition-opacity w-9 h-9 border border-gray-200">
                                            <AvatarImage src={userInfo.photo} />
                                            <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                                {userInfo.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                                            <User className="mr-2 h-4 w-4" /> Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/userdash')}>
                                            <span>User Dashboard</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                                            <LogOut className="mr-2 h-4 w-4" /> Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Added LayoutDashboard to the import list below
import { Plus, LogOut, User, ChevronDown, PlusCircle, Check, LayoutDashboard } from 'lucide-react';
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


    const [addQuestionType, setAddQuestionType] = useState('multiple_choice');

    // Helper mapping for display text
    const questionTypeLabels = {
        multiple_choice: 'Multiple Choice',
        checkbox: 'Checkbox',
        short_answer: 'Short Answer'
    };

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
        <nav className="w-full px-4 h-16 z-50 sticky top-5 left-2 right-2 bg-transparent border-none bg-background/80 backdrop-blur-md">
            <div className=" px-4 h-full flex justify-between items-center">

                <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                    <img src="/favicon.ico" alt="Home" className="w-8 h-8 object-contain" />
                </Link>

                <div className="flex-1"></div>

                {/* --- RIGHT: CONTEXTUAL TOOLS --- */}
                {/* Fixed alignment here: items-right -> items-center */}
                <div className="flex items-center gap-4">

                    {/* CASE 1: ANONYMOUS USER */}
                    {!isAuthenticated && (
                        <>
                            <Link to="/register">
                                <Button variant="ghost"  className=" bg-[#778DA9] text-[var(--color-primary)] hover:bg-gray-100">
                                    REGISTER
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="ghost"  className=" bg-[#778DA9] text-[var(--color-primary)] hover:bg-gray-100">
                                    LOG IN
                                </Button>
                            </Link>
                        </>
                    )}

                    {/* CASE 2: LOGGED IN USER */}
                    {isAuthenticated && (
                        <>
                            {/* SUB-CASE A: SURVEY EDITOR MODE */}
                            {isEditor ? (
                                <div className="flex items-center shadow-sm rounded-md">
                                    <Button
                                        className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] gap-2 rounded-r-none border-r border-white/20"
                                        onClick={() => triggerAddQuestion(addQuestionType)}
                                    >
                                        <PlusCircle size={16} />
                                        ADD QUESTION: {questionTypeLabels[addQuestionType].toUpperCase()}
                                    </Button>

                                    {/* Dropdown Trigger: Selects the question type */}
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <Button className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] rounded-l-none px-2">
                                                <ChevronDown size={14} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-white">
                                            <DropdownMenuLabel>Select Default Type</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setAddQuestionType('multiple_choice')} className="justify-between cursor-pointer">
                                                Multiple Choice
                                                {addQuestionType === 'multiple_choice' && <Check size={14} />}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setAddQuestionType('checkbox')} className="justify-between cursor-pointer">
                                                Checkbox
                                                {addQuestionType === 'checkbox' && <Check size={14} />}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setAddQuestionType('short_answer')} className="justify-between cursor-pointer">
                                                Short Answer
                                                {addQuestionType === 'short_answer' && <Check size={14} />}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <Link to="/survey/create">
                                    <Button className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] gap-2">
                                        <Plus size={16} />
                                        CREATE SURVEY
                                    </Button>
                                </Link>
                            )}


                            <div className="flex  items-center gap-2 ml-2 pl-2 border-l ">
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="bg-white rounded-full h-auto py-1 pr-1 pl-4 hover:bg-gray-100 flex items-center gap-3 transition-all border border-transparent hover:border-gray-200">
                                            <span className="text-sm font-medium text-gray-700 hidden md:block">
                                                Welcome, {userInfo.name}
                                            </span>
                                            <Avatar className="w-8 h-8 border border-gray-200">
                                                <AvatarImage src={userInfo.photo} />
                                                <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                                    {userInfo.name && userInfo.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 bg-white">
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                                            <User className="mr-2 h-4 w-4" /> Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/userdash')}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" /> User Dashboard
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
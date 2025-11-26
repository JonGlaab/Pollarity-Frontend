import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox'; // Import Checkbox

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        first_name: '',
        last_name: '',
        email: '',
    });
    const [userPhotoUrl, setUserPhotoUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [removePhoto, setRemovePhoto] = useState(false); // State for the checkbox
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get('/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser({
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                    email: response.data.email,
                });
                setUserPhotoUrl(response.data.user_photo_url);
            } catch (err) {
                console.error("Failed to fetch user data", err);
                setError('Failed to load profile. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleTextChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        const formData = new FormData();
        formData.append('first_name', user.first_name);
        formData.append('last_name', user.last_name);
        formData.append('email', user.email);
        if (selectedFile) {
            formData.append('profile_photo', selectedFile);
        }
        if (removePhoto) {
            formData.append('remove_photo', 'true');
        }

        try {
            const response = await axios.put('/api/users/me', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            alert('Profile updated successfully!');
            setUser({
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                email: response.data.email,
            });
            setUserPhotoUrl(response.data.user_photo_url);
            setSelectedFile(null);
            setRemovePhoto(false); // Reset checkbox
        } catch (err) {
            console.error("Failed to update profile", err);
            alert('Failed to update profile.');
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading profile...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-8">{error}</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <Card className="p-4 bg-white border rounded-lg">
                <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>View and edit your personal information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center space-x-4 mb-6">
                            <img src={userPhotoUrl || 'https://pollarity-profile-photos.s3.ca-east-006.backblazeb2.com/default-profile.png'} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                            <div>
                                <Label htmlFor="photo-upload">Update Photo</Label>
                                <Input id="photo-upload" type="file" onChange={handleFileChange} className="mt-1" />
                                <div className="flex items-center space-x-2 mt-2">
                                    <Checkbox id="remove_photo" checked={removePhoto} onCheckedChange={setRemovePhoto} />
                                    <Label htmlFor="remove_photo">Remove profile photo</Label>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input id="first_name" name="first_name" value={user.first_name} onChange={handleTextChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input id="last_name" name="last_name" value={user.last_name} onChange={handleTextChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={user.email} onChange={handleTextChange} />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Redirect, useLocation } from "wouter";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if user is logged in
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormValues) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username}!`,
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      isAdmin: false,
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-discord-darker">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-discord-secondary border-gray-800 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-white">
              Discord Bot Dashboard
            </CardTitle>
            <CardDescription className="text-discord-light">
              Access your Discord bot's admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6 bg-discord-dark">
                <TabsTrigger value="login" className="data-[state=active]:bg-discord-primary data-[state=active]:text-white">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-discord-primary data-[state=active]:text-white">
                  Register
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-discord-lighter">Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="admin"
                              className="bg-discord-darker border-gray-700 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-discord-lighter">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="bg-discord-darker border-gray-700 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-discord-primary hover:bg-opacity-90"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-discord-lighter">Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter username"
                              className="bg-discord-darker border-gray-700 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-discord-lighter">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="bg-discord-darker border-gray-700 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-discord-lighter">Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="bg-discord-darker border-gray-700 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-discord-primary hover:bg-opacity-90"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="hidden md:flex flex-1 bg-discord-dark items-center justify-center p-10">
        <div className="max-w-xl text-center">
          <div className="mb-6">
            <div className="h-24 w-24 mx-auto rounded-full bg-discord-primary flex items-center justify-center text-white text-4xl font-bold">
              DB
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Discord Bot Dashboard</h1>
          <p className="text-discord-light text-lg mb-6">
            A powerful administration panel for your Discord bot with over 150 commands.
            Manage moderation, gambling games, and utility features with ease.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-discord-darker rounded-lg">
              <i className="fas fa-gavel text-2xl text-discord-primary mb-2"></i>
              <h3 className="font-semibold text-white">Moderation</h3>
              <p className="text-sm text-discord-light">Ban, kick, mute users</p>
            </div>
            <div className="p-4 bg-discord-darker rounded-lg">
              <i className="fas fa-dice text-2xl text-discord-primary mb-2"></i>
              <h3 className="font-semibold text-white">Gambling</h3>
              <p className="text-sm text-discord-light">Games and virtual currency</p>
            </div>
            <div className="p-4 bg-discord-darker rounded-lg">
              <i className="fas fa-tools text-2xl text-discord-primary mb-2"></i>
              <h3 className="font-semibold text-white">Utility</h3>
              <p className="text-sm text-discord-light">Helpful server tools</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

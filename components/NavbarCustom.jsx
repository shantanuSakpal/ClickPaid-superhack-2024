"use client";
import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link, Button } from "@nextui-org/react";
import Image from "next/image";

export default function App() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <Navbar shouldHideOnScroll onMenuOpenChange={setIsMenuOpen} className="my-3">
            <NavbarContent>
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden"
                />
                <NavbarBrand>
                    <Image src="/img/clickpaid_logo.jpg" alt={"logo"} width={150} height={40} />
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem>
                    <Link   className="text-xl" color="foreground" href="/create">
                        Create
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link className="text-xl"  color="foreground" href="/vote">
                        Vote
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link className="text-xl" color="foreground" href="/earn">
                        Earn
                    </Link>
                </NavbarItem>
            </NavbarContent>

            <NavbarContent justify="end">
                <NavbarItem className="hidden lg:flex">
                    <Button className="dark text-lg">Login</Button>
                </NavbarItem>
                <NavbarMenu>
                    <NavbarMenuItem>
                        <Link color="foreground" href="/create">
                            Create
                        </Link>
                    </NavbarMenuItem>
                    <NavbarMenuItem>
                        <Link color="foreground" href="/vote">
                            Vote
                        </Link>
                    </NavbarMenuItem>
                    <NavbarMenuItem>
                        <Link className="" color="foreground" href="/earn">
                            Earn
                        </Link>
                    </NavbarMenuItem>
                </NavbarMenu>
            </NavbarContent>
        </Navbar>
    );
}
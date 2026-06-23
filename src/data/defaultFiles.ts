import { FileNode } from '../types';

export const defaultFiles: FileNode[] = [
  {
    id: 'root-scripts',
    name: 'Scripts',
    type: 'folder',
    parentId: null,
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-20T10:00:00Z',
    size: 0,
  },
  {
    id: 'root-modules',
    name: 'Modules',
    type: 'folder',
    parentId: null,
    createdAt: '2026-06-21T12:00:00Z',
    updatedAt: '2026-06-21T12:00:00Z',
    size: 0,
  },
  {
    id: 'chassis-physics',
    name: 'SuspensionSolver.luau',
    type: 'file',
    parentId: 'root-scripts',
    language: 'luau',
    isFavorite: true,
    createdAt: '2026-06-22T08:30:00Z',
    updatedAt: '2026-06-23T04:15:00Z',
    size: 1350,
    content: `--!strict
-- SuspensionSolver.luau
-- Manages high-performance double-wishbone physics with dynamic anti-roll calculation

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local PhysicsSolver = {}
PhysicsSolver.__index = PhysicsSolver

type SolverConfig = {
    SpringStiffness: number,
    DamperConstant: number,
    TargetHeight: number,
    AntiRollFactor: number
}

function PhysicsSolver.new(vehicleModel: Model, config: SolverConfig)
    local self = setmetatable({}, PhysicsSolver)
    self.Vehicle = vehicleModel
    self.Config = config
    self.Active = true
    self.Speed = 0
    
    self.RootPart = vehicleModel:FindFirstChild("HumanoidRootPart") :: BasePart
    self.Thrusters = vehicleModel:FindFirstChild("Thrusters") :: Folder
    
    if not self.RootPart then
        warn("[Physics] HumanoidRootPart missing! Physics core suspended.")
    else
        print("[Physics] System initialized successfully.")
    end
    
    return self
end

function PhysicsSolver:UpdatePhysics(dt: number)
    if not self.Active or not self.RootPart then return end
    
    local forwardVector = self.RootPart.CFrame.LookVector
    local velocity = self.RootPart.AssemblyLinearVelocity
    self.Speed = math.max(0, velocity:Dot(forwardVector)) * 3.6 -- KM/H
    
    -- Spring Suspension Raycasting
    for _, thruster in ipairs(self.Thrusters:GetChildren()) do
        if thruster:IsA("Attachment") then
            -- Raycast parameters setup and spring calculations
            print("Processing active suspension updates at " .. math.floor(self.Speed) .. " km/h")
        end
    end
end

return PhysicsSolver
`,
  },
  {
    id: 'anti-cheat',
    name: 'SecureGuard.luau',
    type: 'file',
    parentId: 'root-scripts',
    language: 'luau',
    createdAt: '2026-06-21T14:10:00Z',
    updatedAt: '2026-06-21T14:10:00Z',
    size: 1120,
    content: `--!strict
-- SecureGuard.luau
-- Monitors user velocity, remote events, and suspicious speed anomalies

local Players = game:GetService("Players")

local MAX_WALKSPEED_THRESHOLD = 24.0
local BAN_STRIKES_LIMIT = 3
local PlayerFlags = {}

local function FlagPlayer(player: Player, reason: string)
    if not PlayerFlags[player.UserId] then
        PlayerFlags[player.UserId] = { strikes = 0, logged = {} }
    end
    
    local data = PlayerFlags[player.UserId]
    data.strikes += 1
    table.insert(data.logged, string.format("[%s] Flagged: %s", os.date("%H:%M:%S"), reason))
    
    warn(string.format("[Security] Player %s flagged. strikes: %d", player.Name, data.strikes))
    
    if data.strikes >= BAN_STRIKES_LIMIT then
        player:Kick("Unauthorized physical manipulation detected.")
    end
end

Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function(character)
        local root = character:WaitForChild("HumanoidRootPart", 5) :: BasePart
        local hum = character:WaitForChild("Humanoid", 5) :: Humanoid
        
        if not root or not hum then return end
        
        task.spawn(function()
            while character.Parent and task.wait(1) do
                if hum.WalkSpeed > MAX_WALKSPEED_THRESHOLD then
                    FlagPlayer(player, "WalkSpeed threshold exceeded")
                end
            end
        end)
    end)
end)

print("[Security] Active monitoring loaded.")
`,
  },
  {
    id: 'tween-utils',
    name: 'TweenUtils.luau',
    type: 'file',
    parentId: 'root-modules',
    language: 'luau',
    createdAt: '2026-06-22T11:45:00Z',
    updatedAt: '2026-06-22T15:20:00Z',
    size: 850,
    content: `--!strict
-- TweenUtils.luau
-- Shared UI animation helpers

local TweenService = game:GetService("TweenService")
local TweenUtils = {}

type TweenParams = {
    Duration: number?,
    EasingStyle: Enum.EasingStyle?,
    EasingDirection: Enum.EasingDirection?
}

function TweenUtils.FadeIn(instance: GuiObject, customParams: TweenParams?): Tween
    local duration = (customParams and customParams.Duration) or 0.35
    local style = (customParams and customParams.EasingStyle) or Enum.EasingStyle.Circular
    local direction = (customParams and customParams.EasingDirection) or Enum.EasingDirection.Out
    
    instance.BackgroundTransparency = 1
    instance.Visible = true
    
    local tweenInfo = TweenInfo.new(duration, style, direction)
    local tween = TweenService:Create(instance, tweenInfo, { BackgroundTransparency = 0 })
    tween:Play()
    return tween
end

return TweenUtils
`,
  }
];

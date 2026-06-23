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
    id: 'porsche-chassis',
    name: 'SmoothPorscheChassis.luau',
    type: 'file',
    parentId: 'root-scripts',
    language: 'luau',
    isFavorite: true,
    createdAt: '2026-06-22T08:30:00Z',
    updatedAt: '2026-06-23T04:15:00Z',
    size: 1942,
    content: `--!strict
-- Incognito Workspace Premium Porsche Active Chassis Controller [v3.0.4]
-- Manages high-performance double-wishbone physics with dynamic anti-roll bar calculations

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

local ChassisModule = {}
ChassisModule.__index = ChassisModule

type ChassisConfig = {
    SpringStiffness: number,
    DamperConstant: number,
    TargetHeight: number,
    AntiRollFactor: number,
    TelemetryEnabled: boolean
}

function ChassisModule.new(vehicleModel: Model, config: ChassisConfig)
    local self = setmetatable({}, ChassisModule)
    self.Vehicle = vehicleModel
    self.Config = config
    self.Active = true
    self.Speed = 0
    self.RPM = 0
    
    -- Cache structural joints and reference frames
    self.RootPart = vehicleModel:FindFirstChild("HumanoidRootPart") :: BasePart
    self.Thrusters = vehicleModel:FindFirstChild("Thrusters") :: Folder
    
    if not self.RootPart then
        warn("[Chassis Module] HumanoidRootPart missing! Physics core suspended.")
    else
        print("[Chassis Module] System Calibrated. Stabilizing Porsche active alignment...")
    end
    
    return self
end

function ChassisModule:UpdatePhysics(dt: number)
    if not self.Active or not self.RootPart then return end
    
    local forwardVector = self.RootPart.CFrame.LookVector
    local velocity = self.RootPart.AssemblyLinearVelocity
    self.Speed = math.max(0, velocity:Dot(forwardVector)) * 3.6 -- Converted to KM/H
    
    -- Dynamic Engine Simulation 
    if self.Speed < 2 then
        self.RPM = math.max(800, self.RPM - 10) -- Idle RPM
    else
        self.RPM = math.min(9000, 800 + (self.Speed * 42) % 8200)
    end

    -- Spring Suspension Raycasting loop
    for _, thruster in ipairs(self.Thrusters:GetChildren()) do
        if thruster:IsA("Attachment") then
            local rayOrigin = thruster.WorldPosition
            local rayDirection = -thruster.WorldCFrame.UpVector * (self.Config.TargetHeight * 1.5)
            
            local raycastParams = RaycastParams.new()
            raycastParams.FilterDescendantsInstances = {self.Vehicle}
            raycastParams.FilterType = Enum.RaycastFilterType.Exclude
            
            local result = workspace:Raycast(rayOrigin, rayDirection, raycastParams)
            if result then
                local displacement = self.Config.TargetHeight - result.Distance
                local relativeVelocity = thruster.WorldAxisVelocity:Dot(thruster.WorldCFrame.UpVector)
                
                -- Custom Hooke's Law + Damper calculation
                local force = (displacement * self.Config.SpringStiffness) - (relativeVelocity * self.Config.DamperConstant)
                
                -- Apply suspension anti-roll adjustments based on speed and cornering yaw
                local lateralGForce = self.RootPart.AssemblyAngularVelocity.Y * self.Speed * 0.05
                local antiRollForce = lateralGForce * self.Config.AntiRollFactor
                
                -- Push force up to the chassis
                local calculatedForceVector = thruster.WorldCFrame.UpVector * (force + antiRollForce)
                self.RootPart:ApplyImpulseAtPosition(calculatedForceVector * dt, rayOrigin)
            end
        end
    end
end

return ChassisModule
`,
  },
  {
    id: 'anti-cheat',
    name: 'ServerAntiCheat.luau',
    type: 'file',
    parentId: 'root-scripts',
    language: 'luau',
    createdAt: '2026-06-21T14:10:00Z',
    updatedAt: '2026-06-21T14:10:00Z',
    size: 1540,
    content: `--!strict
-- Incognito Workspace Auto-Defense Server Anti-Cheat [v1.0.12]
-- Monitors user velocity, remote events, and suspicious frame rate spikes

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local MAX_WALKSPEED_THRESHOLD = 24.5 -- Roblox default is 16
local MAX_TELEPORT_DISTANCE = 45 -- Permitted studs travel per second
local BAN_STRIKES_LIMIT = 3

local PlayerFlags = {}

local function FlagPlayer(player: Player, reason: string)
    if not PlayerFlags[player.UserId] then
        PlayerFlags[player.UserId] = { strikes = 0, logged = {} }
    end
    
    local data = PlayerFlags[player.UserId]
    data.strikes += 1
    table.insert(data.logged, string.format("[%s] Flagged: %s", os.date("%H:%M:%S"), reason))
    
    warn(string.format("[Anti-Cheat] Player %s flagged! Strikes: %d. Reason: %s", player.Name, data.strikes, reason))
    
    if data.strikes >= BAN_STRIKES_LIMIT then
        player:Kick("[Security Notice] Virtual security system detected unauthorized software memory execution.")
    end
end

Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function(character)
        local root = character:WaitForChild("HumanoidRootPart", 5) :: BasePart
        local hum = character:WaitForChild("Humanoid", 5) :: Humanoid
        
        if not root or not hum then return end
        
        local lastPosition = root.Position
        
        -- Secure physics check loop
        task.spawn(function()
            while character.Parent and task.wait(1) do
                local currentPosition = root.Position
                local distance = (currentPosition - lastPosition).Magnitude
                
                -- Height / Floor boundary checks
                if distance > MAX_TELEPORT_DISTANCE then
                    FlagPlayer(player, "Teleport Detected (Moved " .. math.floor(distance) .. " studs in 1s)")
                end
                
                -- Walkspeed tracker
                if hum.WalkSpeed > MAX_WALKSPEED_THRESHOLD then
                    FlagPlayer(player, "WalkSpeed Hack Triggered (Speed: " .. hum.WalkSpeed .. " studs/s)")
                end
                
                lastPosition = currentPosition
            end
        end)
    end)
end)

print("[Anti-Cheat] Secure monitoring framework fully loaded.")
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
    size: 1120,
    content: `--!strict
-- Incognito Workspace UI Tween Helpers
-- Creates smooth porsche-like UI transitions and responsive hover effects

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

function TweenUtils.GlowAccent(instance: ImageLabel, active: boolean)
    local targetGlow = active and 0.2 or 0.8
    local tweenInfo = TweenInfo.new(0.25, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut)
    local tween = TweenService:Create(instance, tweenInfo, { ImageTransparency = targetGlow })
    tween:Play()
end

return TweenUtils
`,
  }
];

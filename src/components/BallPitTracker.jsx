import { useState, useMemo } from 'react';
import { 
	ballTypes, 
	getBaseBalls, 
	getAllUpgradePaths 
} from '../data/ballpit-data.js';

// Helper component for displaying ball image or icon
const BallImage = ({ ball, size = '48px' }) => {
	if (ball.imageUrl) {
		return <img src={ball.imageUrl} alt={ball.name} style={{ width: size, height: size, objectFit: 'contain' }} />;
	}
	const fontSize = size === '96px' ? '3rem' : size === '48px' ? '2rem' : '1.5rem';
	return <div style={{ fontSize }}>{ball.icon || '⚪'}</div>;
};

export default function BallPitTracker() {
	const [ownedBalls, setOwnedBalls] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [activeTab, setActiveTab] = useState('collection'); // collection, upgrades, potential, trees, premium
	const [selectedPremiumBall, setSelectedPremiumBall] = useState(null);

	// Filter balls based on search term
	const filteredBalls = useMemo(() => {
		const allBalls = Object.values(ballTypes);
		if (!searchTerm) return allBalls;
		
		const term = searchTerm.toLowerCase();
		return allBalls.filter(ball => 
			ball.name.toLowerCase().includes(term) ||
			ball.description.toLowerCase().includes(term)
		);
	}, [searchTerm]);

	// Get premium balls (epic and legendary)
	const premiumBalls = useMemo(() => {
		return Object.values(ballTypes).filter(ball => 
			ball.rarity === 'epic' || ball.rarity === 'legendary'
		);
	}, []);

	// Calculate upgrade paths
	const upgradePaths = useMemo(() => {
		if (ownedBalls.length === 0) return { evolutions: [], fusions: [], potentials: [], fusionTrees: [] };
		return getAllUpgradePaths(ownedBalls);
	}, [ownedBalls]);

	// Add ball to collection
	const addBall = (ballId) => {
		if (!ownedBalls.includes(ballId)) {
			setOwnedBalls([...ownedBalls, ballId]);
			setSearchTerm(''); // Clear search after adding
		}
	};

	// Remove ball from collection
	const removeBall = (ballId) => {
		setOwnedBalls(ownedBalls.filter(id => id !== ballId));
	};

	// Clear all balls
	const clearAll = () => {
		setOwnedBalls([]);
	};

	const rarityColors = {
		common: '#9ca3af',
		uncommon: '#22c55e',
		rare: '#3b82f6',
		epic: '#a855f7',
		legendary: '#f59e0b'
	};

	return (
		<div style={{ 
			fontFamily: 'system-ui, -apple-system, sans-serif',
			maxWidth: '1200px',
			margin: '0 auto',
			padding: '20px'
		}}>
			<h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
				Ball Pit Upgrade Tracker
			</h1>
			
			<p style={{ color: '#6b7280', marginBottom: '2rem' }}>
				Track your balls and discover all possible evolutions and fusions
			</p>

			{/* Search Bar */}
			<div style={{ marginBottom: '2rem' }}>
				<input
					type="text"
					placeholder="Search for a ball to add..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					style={{
						width: '100%',
						padding: '12px',
						fontSize: '1rem',
						border: '2px solid #e5e7eb',
						borderRadius: '8px',
						outline: 'none'
					}}
				/>
				
				{/* Search Results Dropdown */}
				{searchTerm && (
					<div style={{
						marginTop: '8px',
						border: '2px solid #e5e7eb',
						borderRadius: '8px',
						backgroundColor: 'white',
						maxHeight: '300px',
						overflowY: 'auto',
						boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
					}}>
						{filteredBalls.length > 0 ? (
							filteredBalls.map(ball => (
								<div
									key={ball.id}
									onClick={() => addBall(ball.id)}
									style={{
										padding: '12px',
										borderBottom: '1px solid #e5e7eb',
										cursor: 'pointer',
										display: 'flex',
										justifyContent: 'space-between',
									alignItems: 'center',
									gap: '12px'
								}}
								onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
								onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
							>
								<div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
								<BallImage ball={ball} size="48px" />
									<div style={{ flex: 1 }}>
										<div style={{ fontWeight: '600' }}>{ball.name}</div>
										<div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
											{ball.description}
										</div>
										</div>
									</div>
									<div style={{
										padding: '4px 8px',
										borderRadius: '4px',
										fontSize: '0.75rem',
										fontWeight: '600',
										color: 'white',
										backgroundColor: rarityColors[ball.rarity]
									}}>
										{ball.rarity}
									</div>
								</div>
							))
						) : (
							<div style={{ padding: '12px', color: '#6b7280' }}>
								No balls found
							</div>
						)}
					</div>
				)}
			</div>

			{/* Tabs */}
			<div style={{ 
				display: 'flex', 
				gap: '8px', 
				marginBottom: '2rem',
				borderBottom: '2px solid #e5e7eb',
				flexWrap: 'wrap'
			}}>
				{['collection', 'upgrades', 'potential', 'trees', 'premium'].map(tab => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						style={{
							padding: '12px 24px',
							border: 'none',
							backgroundColor: 'transparent',
							cursor: 'pointer',
							fontWeight: '600',
							color: activeTab === tab ? '#3b82f6' : '#6b7280',
							borderBottom: activeTab === tab ? '3px solid #3b82f6' : '3px solid transparent',
							transition: 'all 0.2s'
						}}
					>
						{tab === 'collection' && `My Balls (${ownedBalls.length})`}
						{tab === 'upgrades' && `Available Upgrades (${upgradePaths.evolutions.length + upgradePaths.fusions.length})`}
						{tab === 'potential' && `Potential Upgrades (${upgradePaths.potentials.length})`}
						{tab === 'trees' && `Fusion Trees (${upgradePaths.fusionTrees.length})`}
						{tab === 'premium' && `Epic & Legendary (${premiumBalls.length})`}
					</button>
				))}
			</div>

			{/* Content Area */}
			<div>
				{/* Collection Tab */}
				{activeTab === 'collection' && (
					<div>
						{ownedBalls.length > 0 ? (
							<>
								<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
									<button
										onClick={clearAll}
										style={{
											padding: '8px 16px',
											backgroundColor: '#ef4444',
											color: 'white',
											border: 'none',
											borderRadius: '6px',
											cursor: 'pointer',
											fontWeight: '600'
										}}
									>
										Clear All
									</button>
								</div>
								<div style={{ 
									display: 'grid', 
									gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
									gap: '16px'
								}}>
									{ownedBalls.map(ballId => {
										const ball = ballTypes[ballId];
										return (
											<div
												key={ballId}
												style={{
													border: '2px solid #e5e7eb',
													borderRadius: '8px',
													padding: '16px',
													position: 'relative'
												}}
											>
												<button
													onClick={() => removeBall(ballId)}
													style={{
														position: 'absolute',
														top: '8px',
														right: '8px',
														width: '24px',
														height: '24px',
														borderRadius: '50%',
														border: 'none',
														backgroundColor: '#ef4444',
														color: 'white',
														cursor: 'pointer',
														fontSize: '16px',
														lineHeight: '1'
													}}
												>
													×
												</button>
												<div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
													<BallImage ball={ball} size="96px" />
												</div>
												<div style={{ fontWeight: '600', marginBottom: '8px' }}>
													{ball.name}
												</div>
												<div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
													{ball.description}
												</div>
												<div style={{
													display: 'inline-block',
													padding: '4px 8px',
													borderRadius: '4px',
													fontSize: '0.75rem',
													fontWeight: '600',
													color: 'white',
													backgroundColor: rarityColors[ball.rarity]
												}}>
													{ball.rarity}
												</div>
												<div style={{ 
													marginTop: '8px',
													fontSize: '0.75rem',
													color: '#9ca3af',
													textTransform: 'uppercase'
												}}>
													{ball.type}
												</div>
											</div>
										);
									})}
								</div>
							</>
						) : (
							<div style={{ 
								textAlign: 'center', 
								padding: '60px 20px',
								color: '#6b7280'
							}}>
								<div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚽</div>
								<div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>
									No balls in your collection
								</div>
								<div>Use the search bar above to add balls</div>
							</div>
						)}
					</div>
				)}

				{/* Upgrades Tab */}
				{activeTab === 'upgrades' && (
					<div>
						{ownedBalls.length === 0 ? (
							<div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
								Add some balls to your collection to see available upgrades
							</div>
						) : (
							<>
								{/* Evolutions */}
								{upgradePaths.evolutions.length > 0 && (
									<div style={{ marginBottom: '2rem' }}>
										<h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
											🔄 Evolutions
										</h2>
										<div style={{ 
											display: 'grid', 
											gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
											gap: '16px'
										}}>
											{upgradePaths.evolutions.map((evo, idx) => (
												<div
													key={idx}
													style={{
														border: '2px solid #e5e7eb',
														borderRadius: '8px',
														padding: '16px'
													}}
												>
													<div style={{ marginBottom: '12px' }}>
														<div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>
															FROM
														</div>
														<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
													<BallImage ball={evo.from} size="48px" />
															<div style={{ fontWeight: '600' }}>{evo.from.name}</div>
														</div>
													</div>
													<div style={{ margin: '12px 0', textAlign: 'center', fontSize: '1.5rem' }}>
														↓
													</div>
													<div>
														<div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
															TO (Choose one)
														</div>
														{evo.options.map(ball => (
															<div
																key={ball.id}
																style={{
																	padding: '8px',
																	marginBottom: '8px',
																	backgroundColor: '#f9fafb',
																	borderRadius: '6px'
																}}
															>
																<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
															<BallImage ball={ball} size="36px" />
																	<div style={{ fontWeight: '600' }}>{ball.name}</div>
																</div>
																<div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
																	{ball.description}
																</div>
																<div style={{
																	display: 'inline-block',
																	marginTop: '4px',
																	padding: '2px 6px',
																	borderRadius: '4px',
																	fontSize: '0.75rem',
																	fontWeight: '600',
																	color: 'white',
																	backgroundColor: rarityColors[ball.rarity]
																}}>
																	{ball.rarity}
																</div>
															</div>
														))}
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Fusions */}
								{upgradePaths.fusions.length > 0 && (
									<div>
										<h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
											⚡ Fusions
										</h2>
										<div style={{ 
											display: 'grid', 
											gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
											gap: '16px'
										}}>
											{upgradePaths.fusions.map((fusion, idx) => (
												<div
													key={idx}
													style={{
														border: '2px solid #e5e7eb',
														borderRadius: '8px',
														padding: '16px'
													}}
												>
													<div style={{ marginBottom: '12px' }}>
														<div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
															COMBINE
														</div>
														{fusion.ingredients.map(ball => (
															<div
																key={ball.id}
																style={{
																	padding: '6px',
																	marginBottom: '4px',
																	backgroundColor: '#f9fafb',
																	borderRadius: '4px',
																	fontSize: '0.875rem',
																	fontWeight: '500',
																	display: 'flex',
																	alignItems: 'center',
																	gap: '8px'
																}}
															>
																<BallImage ball={ball} size="32px" />
																<div>{ball.name}</div>
															</div>
														))}
													</div>
													<div style={{ margin: '12px 0', textAlign: 'center', fontSize: '1.5rem' }}>
														↓
													</div>
													<div>
														<div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>
															RESULT
														</div>
														<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
															<BallImage ball={fusion.result} size="48px" />
															<div style={{ fontWeight: '600' }}>{fusion.result.name}</div>
														</div>
														<div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
															{fusion.result.description}
														</div>
														<div style={{
															display: 'inline-block',
															padding: '4px 8px',
															borderRadius: '4px',
															fontSize: '0.75rem',
															fontWeight: '600',
															color: 'white',
															backgroundColor: rarityColors[fusion.result.rarity]
														}}>
															{fusion.result.rarity}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{upgradePaths.evolutions.length === 0 && upgradePaths.fusions.length === 0 && (
									<div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
										<div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>
											No upgrades available yet
										</div>
										<div>Try adding more balls or different combinations</div>
									</div>
								)}
							</>
						)}
					</div>
				)}

				{/* Potential Tab */}
				{activeTab === 'potential' && (
					<div>
						{ownedBalls.length === 0 ? (
							<div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
								Add some balls to your collection to see potential upgrades
							</div>
						) : upgradePaths.potentials.length > 0 ? (
							<div>
								<h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
									🎯 Potential Fusions
								</h2>
								<p style={{ color: '#6b7280', marginBottom: '1rem' }}>
									These fusions are possible if you get the missing balls
								</p>
								<div style={{ 
									display: 'grid', 
									gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
									gap: '16px'
								}}>
									{upgradePaths.potentials.map((fusion, idx) => (
										<div
											key={idx}
											style={{
												border: '2px solid #fbbf24',
												borderRadius: '8px',
												padding: '16px',
												backgroundColor: '#fffbeb'
											}}
										>
											<div style={{ marginBottom: '12px' }}>
												<div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '8px' }}>
													YOU HAVE
												</div>
												{fusion.owned.map(ball => (
													<div
														key={ball.id}
														style={{
															padding: '6px',
															marginBottom: '4px',
															backgroundColor: '#d1fae5',
															borderRadius: '4px',
															fontSize: '0.875rem',
															fontWeight: '500',
															color: '#065f46',
															display: 'flex',
															alignItems: 'center',
															gap: '8px'
														}}
													>
														<BallImage ball={ball} size="32px" />
														<div>✓ {ball.name}</div>
													</div>
												))}
												<div style={{ fontSize: '0.875rem', color: '#92400e', marginTop: '12px', marginBottom: '8px' }}>
													YOU NEED
												</div>
												{fusion.missing.map(ball => (
													<div
														key={ball.id}
														style={{
															padding: '6px',
															marginBottom: '4px',
															backgroundColor: '#fee2e2',
															borderRadius: '4px',
															fontSize: '0.875rem',
															fontWeight: '500',
															color: '#991b1b',
															display: 'flex',
															alignItems: 'center',
															gap: '8px'
														}}
													>
														<BallImage ball={ball} size="32px" />
														<div>✗ {ball.name}</div>
													</div>
												))}
											</div>
											<div style={{ margin: '12px 0', textAlign: 'center', fontSize: '1.5rem' }}>
												↓
											</div>
											<div>
												<div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '4px' }}>
													WILL CREATE
												</div>
												<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
													<BallImage ball={fusion.result} size="48px" />
													<div style={{ fontWeight: '600' }}>{fusion.result.name}</div>
												</div>
												<div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
													{fusion.result.description}
												</div>
												<div style={{
													display: 'inline-block',
													padding: '4px 8px',
													borderRadius: '4px',
													fontSize: '0.75rem',
													fontWeight: '600',
													color: 'white',
													backgroundColor: rarityColors[fusion.result.rarity]
												}}>
													{fusion.result.rarity}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
								<div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>
									No potential upgrades found
								</div>
								<div>You can already make all available fusions with your current collection!</div>
							</div>
						)}
					</div>
				)}

				{/* Fusion Trees Tab */}
				{activeTab === 'trees' && (
					<div>
						{ownedBalls.length === 0 ? (
							<div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
								Add some balls to your collection to see fusion trees
							</div>
						) : upgradePaths.fusionTrees.length > 0 ? (
							<div>
								<h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
									🌳 Multi-Step Fusion Paths
								</h2>
								<p style={{ color: '#6b7280', marginBottom: '1rem' }}>
									Complex fusions that require intermediate steps. Shows what you can eventually create with your current balls.
								</p>
								<div style={{ 
									display: 'grid', 
									gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
									gap: '16px'
								}}>
									{upgradePaths.fusionTrees.map((tree, idx) => (
										<div
											key={idx}
											style={{
												border: '2px solid #8b5cf6',
												borderRadius: '8px',
												padding: '16px',
												backgroundColor: '#faf5ff'
											}}
										>
											{/* Target Ball */}
											<div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #e9d5ff' }}>
												<div style={{ fontSize: '0.875rem', color: '#6b21a8', marginBottom: '4px', fontWeight: '600' }}>
													🎯 TARGET
												</div>
												<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
											<BallImage ball={tree.result} size="64px" />
													<div style={{ fontWeight: '700', fontSize: '1.125rem' }}>
														{tree.result.name}
													</div>
												</div>
												<div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
													{tree.result.description}
												</div>
												<div style={{
													display: 'inline-block',
													padding: '4px 8px',
													borderRadius: '4px',
													fontSize: '0.75rem',
													fontWeight: '600',
													color: 'white',
													backgroundColor: rarityColors[tree.result.rarity]
												}}>
													{tree.result.rarity}
												</div>
												<div style={{
													display: 'inline-block',
													marginLeft: '8px',
													padding: '4px 8px',
													borderRadius: '4px',
													fontSize: '0.75rem',
													fontWeight: '600',
													backgroundColor: '#ddd6fe',
													color: '#6b21a8'
												}}>
													{tree.totalSteps} step{tree.totalSteps !== 1 ? 's' : ''} away
												</div>
											</div>

											{/* What You Have */}
											{tree.path.ownedBalls.length > 0 && (
												<div style={{ marginBottom: '12px' }}>
													<div style={{ fontSize: '0.875rem', color: '#6b21a8', marginBottom: '8px', fontWeight: '600' }}>
														✓ YOU HAVE
													</div>
													{tree.path.ownedBalls.map(ball => (
														<div
															key={ball.id}
															style={{
																padding: '6px',
																marginBottom: '4px',
																backgroundColor: '#d1fae5',
																borderRadius: '4px',
																fontSize: '0.875rem',
																fontWeight: '500',
																color: '#065f46',
																display: 'flex',
																alignItems: 'center',
																gap: '8px'
															}}
														>
													<BallImage ball={ball} size="32px" />
															<div>{ball.name}</div>
														</div>
													))}
												</div>
											)}

											{/* Required Intermediate Fusions */}
											{tree.path.requiredFusions.length > 0 && (
												<div style={{ marginBottom: '12px' }}>
													<div style={{ fontSize: '0.875rem', color: '#6b21a8', marginBottom: '8px', fontWeight: '600' }}>
														⚡ FIRST MAKE THESE
													</div>
													{tree.path.requiredFusions.map((rf, rfIdx) => (
														<div
															key={rfIdx}
															style={{
																padding: '8px',
																marginBottom: '8px',
																backgroundColor: '#e0e7ff',
																borderRadius: '6px',
																border: '1px solid #c7d2fe'
															}}
														>
															<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
													<BallImage ball={rf.ball} size="36px" />
																<div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#4338ca' }}>
																	{rf.ball.name}
																</div>
															</div>
															{rf.subPath.path.ownedBalls.length > 0 && (
																<div style={{ fontSize: '0.75rem', color: '#065f46', marginBottom: '2px' }}>
																	✓ Have: {rf.subPath.path.ownedBalls.map(b => b.name).join(', ')}
																</div>
															)}
															{rf.subPath.missing.length > 0 && (
																<div style={{ fontSize: '0.75rem', color: '#991b1b' }}>
																	✗ Need: {rf.subPath.missing.map(b => b.name).join(', ')}
																</div>
															)}
														</div>
													))}
												</div>
											)}

											{/* Missing Base Balls */}
											{tree.path.missingBalls.length > 0 && (
												<div style={{ marginBottom: '12px' }}>
													<div style={{ fontSize: '0.875rem', color: '#6b21a8', marginBottom: '8px', fontWeight: '600' }}>
														✗ ALSO NEED
													</div>
													{tree.path.missingBalls.map(ball => (
														<div
															key={ball.id}
															style={{
																padding: '6px',
																marginBottom: '4px',
																backgroundColor: '#fee2e2',
																borderRadius: '4px',
																fontSize: '0.875rem',
																fontWeight: '500',
																color: '#991b1b',
																display: 'flex',
																alignItems: 'center',
																gap: '8px'
															}}
														>
															<BallImage ball={ball} size="32px" />
															<div>{ball.name}</div>
														</div>
													))}
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						) : (
							<div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
								<div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>
									No fusion trees found
								</div>
								<div>Add more balls to discover complex fusion paths!</div>
							</div>
						)}
					</div>
				)}

				{/* Premium Tab */}
				{activeTab === 'premium' && (
					<div>
						<h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
							✨ Epic & Legendary Balls
						</h2>
						<p style={{ color: '#6b7280', marginBottom: '1rem' }}>
							Discover all premium balls and their complete fusion paths. Click any ball to see the full ingredient list.
						</p>

						{/* Premium Balls Grid */}
						<div style={{ 
							display: 'grid', 
							gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
							gap: '16px',
							marginBottom: selectedPremiumBall ? '2rem' : '0'
						}}>
							{premiumBalls.map(ball => {
								const isOwned = ownedBalls.includes(ball.id);
								const isSelected = selectedPremiumBall?.id === ball.id;
								return (
									<div
										key={ball.id}
										onClick={() => setSelectedPremiumBall(isSelected ? null : ball)}
										style={{
											border: isSelected ? `3px solid ${rarityColors[ball.rarity]}` : '2px solid #e5e7eb',
											borderRadius: '8px',
											padding: '16px',
											cursor: 'pointer',
											backgroundColor: isSelected ? '#fef3c7' : 'white',
											transition: 'all 0.2s',
											opacity: isOwned ? 1 : 0.7,
											position: 'relative'
										}}
									>
										{isOwned && (
											<div style={{
												position: 'absolute',
												top: '8px',
												right: '8px',
												backgroundColor: '#10b981',
												color: 'white',
												borderRadius: '50%',
												width: '24px',
												height: '24px',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontSize: '14px',
												fontWeight: 'bold'
											}}>
												✓
											</div>
										)}
										<div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
											<BallImage ball={ball} size="96px" />
										</div>
										<div style={{ fontWeight: '600', marginBottom: '8px' }}>
											{ball.name}
										</div>
										<div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
											{ball.description}
										</div>
										<div style={{
											display: 'inline-block',
											padding: '4px 8px',
											borderRadius: '4px',
											fontSize: '0.75rem',
											fontWeight: '600',
											color: 'white',
											backgroundColor: rarityColors[ball.rarity]
										}}>
											{ball.rarity}
										</div>
										<div style={{ 
											marginTop: '8px',
											fontSize: '0.75rem',
											color: '#9ca3af',
											textTransform: 'uppercase'
										}}>
											{ball.type}
										</div>
									</div>
								);
							})}
						</div>

						{/* Selected Premium Ball Details */}
						{selectedPremiumBall && (
							<div style={{
								border: `3px solid ${rarityColors[selectedPremiumBall.rarity]}`,
								borderRadius: '12px',
								padding: '24px',
								backgroundColor: '#fffbeb'
							}}>
								<div style={{ 
									display: 'flex', 
									justifyContent: 'space-between',
									alignItems: 'flex-start',
									marginBottom: '20px'
								}}>
									<div>
										<h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>
											🔮 How to Get {selectedPremiumBall.name}
										</h3>
										<p style={{ color: '#78716c', fontSize: '0.875rem' }}>
											Complete fusion path with all required ingredients
										</p>
									</div>
									<button
										onClick={() => setSelectedPremiumBall(null)}
										style={{
											padding: '8px 16px',
											backgroundColor: '#6b7280',
											color: 'white',
											border: 'none',
											borderRadius: '6px',
											cursor: 'pointer',
											fontWeight: '600'
										}}
									>
										Close
									</button>
								</div>

								{(() => {
									// Get fusion path for the selected premium ball
									const getFusionPath = (targetBall) => {
										if (targetBall.type === 'base') {
											return { type: 'base', ball: targetBall };
										}
										
										if (targetBall.type === 'evolution') {
											return { 
												type: 'evolution',
												ball: targetBall,
												from: ballTypes[targetBall.evolvesFrom]
											};
										}
										
										if (targetBall.type === 'fusion') {
										const ingredients = targetBall.fusedFrom.map(id => {
											const ingredientBall = ballTypes[id];
											return {
												ball: ingredientBall,
												path: getFusionPath(ingredientBall)
											};
										});
										
										return {
											type: 'fusion',
											ball: targetBall,
											ingredients
										};
									}
									
									return null;
								};

								// Get all base balls needed
									const getAllBaseBalls = (path) => {
										const bases = new Set();
										
										const traverse = (p) => {
											if (p.type === 'base') {
												bases.add(p.ball.id);
											} else if (p.type === 'evolution') {
												traverse(getFusionPath(p.from));
											} else if (p.type === 'fusion') {
												p.ingredients.forEach(ing => traverse(ing.path));
											}
										};
										
										traverse(path);
										return Array.from(bases).map(id => ballTypes[id]);
									};

									const path = getFusionPath(selectedPremiumBall);
									const baseBalls = getAllBaseBalls(path);
									const ownedBaseBalls = baseBalls.filter(b => ownedBalls.includes(b.id));
									const missingBaseBalls = baseBalls.filter(b => !ownedBalls.includes(b.id));

									// Render fusion path recursively
									const renderPath = (p, depth = 0) => {
										const indent = depth * 20;
										
										if (p.type === 'base') {
											const isOwned = ownedBalls.includes(p.ball.id);
											return (
												<div 
													key={p.ball.id}
													style={{
														marginLeft: `${indent}px`,
														padding: '8px',
														marginBottom: '8px',
														backgroundColor: isOwned ? '#d1fae5' : '#fee2e2',
														borderRadius: '6px',
														border: `2px solid ${isOwned ? '#10b981' : '#ef4444'}`,
														display: 'flex',
														alignItems: 'center',
														gap: '8px'
													}}
												>
													<BallImage ball={p.ball} size="32px" />
													<div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
														{isOwned ? '✓' : '✗'} {p.ball.name}
													</div>
													<div style={{
														marginLeft: 'auto',
														padding: '2px 6px',
														borderRadius: '4px',
														fontSize: '0.625rem',
														fontWeight: '600',
														color: 'white',
														backgroundColor: rarityColors[p.ball.rarity]
													}}>
														{p.ball.rarity}
													</div>
												</div>
											);
										}
										
										if (p.type === 'evolution') {
											return (
												<div key={p.ball.id} style={{ marginLeft: `${indent}px`, marginBottom: '12px' }}>
													{renderPath(getFusionPath(p.from), depth)}
													<div style={{ textAlign: 'center', margin: '8px 0', fontSize: '1.25rem' }}>↓ (evolves)</div>
													<div style={{
														padding: '10px',
														backgroundColor: '#e0e7ff',
														borderRadius: '6px',
														border: '2px solid #6366f1',
														display: 'flex',
														alignItems: 'center',
														gap: '8px'
													}}>
														<BallImage ball={p.ball} size="36px" />
														<div style={{ fontWeight: '600' }}>{p.ball.name}</div>
														<div style={{
															marginLeft: 'auto',
															padding: '2px 6px',
															borderRadius: '4px',
															fontSize: '0.625rem',
															fontWeight: '600',
															color: 'white',
															backgroundColor: rarityColors[p.ball.rarity]
														}}>
															{p.ball.rarity}
														</div>
													</div>
												</div>
											);
										}
										
										if (p.type === 'fusion') {
											return (
												<div key={p.ball.id} style={{ marginLeft: `${indent}px`, marginBottom: '12px' }}>
													<div style={{
														padding: '12px',
														backgroundColor: '#fef3c7',
														borderRadius: '8px',
														border: '2px solid #f59e0b',
														marginBottom: '12px'
													}}>
														<div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '8px', fontWeight: '600' }}>
															⚗️ FUSION REQUIRES:
														</div>
														{p.ingredients.map((ing, idx) => (
															<div key={idx} style={{ marginBottom: '8px' }}>
																{renderPath(ing.path, depth + 1)}
															</div>
														))}
														<div style={{ textAlign: 'center', margin: '12px 0', fontSize: '1.5rem' }}>↓</div>
														<div style={{
															padding: '12px',
															backgroundColor: '#fef3c7',
															borderRadius: '6px',
															border: `3px solid ${rarityColors[p.ball.rarity]}`,
															display: 'flex',
															alignItems: 'center',
															gap: '12px'
														}}>
															<BallImage ball={p.ball} size="48px" />
															<div>
																<div style={{ fontWeight: '700', fontSize: '1.125rem' }}>{p.ball.name}</div>
																<div style={{
																	display: 'inline-block',
																	marginTop: '4px',
																	padding: '2px 6px',
																	borderRadius: '4px',
																	fontSize: '0.625rem',
																	fontWeight: '600',
																	color: 'white',
																	backgroundColor: rarityColors[p.ball.rarity]
																}}>
																	{p.ball.rarity}
																</div>
															</div>
														</div>
													</div>
												</div>
											);
										}
										
										return null;
									};

									return (
										<div>
											{/* Summary */}
											<div style={{ 
												display: 'grid',
												gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
												gap: '12px',
												marginBottom: '20px'
											}}>
												<div style={{
													padding: '12px',
													backgroundColor: '#dbeafe',
													borderRadius: '6px',
													border: '2px solid #3b82f6'
												}}>
													<div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: '600' }}>TOTAL BASE BALLS</div>
													<div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{baseBalls.length}</div>
												</div>
												<div style={{
													padding: '12px',
													backgroundColor: '#d1fae5',
													borderRadius: '6px',
													border: '2px solid #10b981'
												}}>
													<div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: '600' }}>YOU HAVE</div>
													<div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{ownedBaseBalls.length}</div>
												</div>
												<div style={{
													padding: '12px',
													backgroundColor: '#fee2e2',
													borderRadius: '6px',
													border: '2px solid #ef4444'
												}}>
													<div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: '600' }}>YOU NEED</div>
													<div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{missingBaseBalls.length}</div>
												</div>
											</div>

											{/* Fusion Path Tree */}
											<div style={{
												backgroundColor: 'white',
												padding: '16px',
												borderRadius: '8px',
												border: '2px solid #d1d5db'
											}}>
												<h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>
													📊 Complete Fusion Path
												</h4>
												{renderPath(path)}
											</div>
										</div>
									);
								})()}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
